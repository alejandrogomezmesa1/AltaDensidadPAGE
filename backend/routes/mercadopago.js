const express = require("express");
const router = express.Router();
const { getConnection } = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
let mercadopago;
try {
  mercadopago = require("mercadopago");
} catch (e) {
  /* optional */
}
const crypto = require("crypto");

const WEBHOOK_SECRET =
  process.env.MP_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SIGNATURE || null;

const ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN ||
  process.env.MERCADOPAGO_ACCESS_TOKEN ||
  process.env.MP_TOKEN;
const FORCE_MOCK =
  String(process.env.MP_FORCE_MOCK || "").toLowerCase() === "1" ||
  String(process.env.MP_FORCE_MOCK || "").toLowerCase() === "true";

function mapPaymentToStatus(paymentStatus) {
  if (!paymentStatus) return "pending";
  const s = String(paymentStatus).toLowerCase();
  if (s === "approved") return "approved";
  if (s === "in_process" || s === "pending") return "pending";
  if (s === "cancelled" || s === "rejected" || s === "refunded")
    return "failed";
  return "pending";
}

// POST /api/mercadopago/create_preference
router.post("/create_preference", async (req, res) => {
  try {
    const { items, payer, shipping } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "La lista de items es requerida" });
    }

    const mpItems = items.map((it) => ({
      id: String(it.id || ""),
      title: String(it.name || it.title || "Producto"),
      description: it.description || "",
      picture_url: it.image || it.picture_url || "",
      category_id: it.category || "general",
      quantity: Number(it.quantity || it.cantidad || 1),
      currency_id: it.currency || "COP",
      unit_price: Number(it.price || it.unit_price || 0),
    }));

    // Calcular total y crear orden en DB
    const total = mpItems.reduce(
      (s, it) => s + Number(it.unit_price || 0) * Number(it.quantity || 0),
      0,
    );
    const external_reference =
      "ORD" + Date.now() + Math.floor(Math.random() * 9000 + 1000);
    const pool = await getConnection();
    try {
      // Intentar insertar con todos los campos. Si falla por columna faltante, el catch manejará la alerta.
      const query = `
        INSERT INTO Ordenes (
          external_reference, items, total, currency, status, 
          envio_nombre, envio_documento, envio_celular, envio_ciudad, 
          envio_direccion, envio_piso, envio_barrio, envio_referencia, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const values = [
        external_reference,
        JSON.stringify(mpItems),
        total,
        "COP",
        "pending",
        shipping ? shipping.nombre : null,
        shipping ? shipping.documento : null,
        shipping ? shipping.celular : null,
        shipping ? shipping.ciudad : null,
        shipping ? shipping.direccion : null,
        shipping ? shipping.piso || null : null,
        shipping ? shipping.barrio || null : null,
        shipping ? shipping.referencia || shipping.reference || null : null,
      ];
      await pool.query(query, values);
    } catch (dbErr) {
      console.error("ERROR CRÍTICO: No se pudo insertar orden en DB:", dbErr);
      return res.status(500).json({ 
        success: false, 
        message: "Error al registrar la orden en la base de datos. Por favor contacta al administrador.",
        error: dbErr.message 
      });
    }

    // Prefer explicit FRONTEND_URL, otherwise detect scheme. For common PaaS (railway/vercel) prefer https.
    const preferHttpsHosts = /railway\.app|vercel\.app|ngrok\.io|localhost/;
    const protocol =
      process.env.FORCE_HTTPS === "1" ||
      preferHttpsHosts.test(req.get("host") || "")
        ? "https"
        : req.protocol;
    const hostBase =
      process.env.FRONTEND_URL || `${protocol}://${req.get("host")}`;
    // Usar datos de envío para pre-llenar el pagador de Mercado Pago si no hay payer explícito
    let mpPayer = payer;
    if (!mpPayer && shipping && shipping.nombre) {
      const [name, ...lastNames] = shipping.nombre.split(" ");
      mpPayer = {
        name: name || "",
        surname: lastNames.join(" ") || "",
      };
    }

    const preference = {
      items: mpItems,
      payer: mpPayer || undefined,
      external_reference,
      back_urls: {
        success: `${hostBase}/success.html`,
        failure: `${hostBase}/failure.html`,
        pending: `${hostBase}/pending.html`,
      },
      auto_return: "approved",
      notification_url:
        process.env.MP_NOTIFICATION_URL ||
        `${req.protocol}://${req.get("host")}/api/mercadopago/webhook`,
    };

    if (!ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "Error de configuración: MP_ACCESS_TOKEN no encontrado en el servidor.",
      });
    }

    // Crear preferencia: preferiblemente usar SDK `mercadopago`, con fallback HTTP
    try {
      // Intentar via SDK si está disponible
      if (mercadopago && typeof mercadopago.preferences !== "undefined") {
        try {
          if (
            mercadopago.configurations &&
            typeof mercadopago.configurations.setAccessToken === "function"
          ) {
            mercadopago.configurations.setAccessToken(ACCESS_TOKEN);
          } else if (typeof mercadopago.configure === "function") {
            mercadopago.configure({ access_token: ACCESS_TOKEN });
          }
        } catch (cfgErr) {
          console.warn(
            "No se pudo configurar SDK mercadopago:",
            cfgErr && cfgErr.message,
          );
        }

        const mpResp = await mercadopago.preferences.create(preference);
        const body =
          mpResp && (mpResp.body || mpResp) ? mpResp.body || mpResp : mpResp;
        // Guardar preference_id en la orden si es posible
        try {
          await pool.query(
            "UPDATE Ordenes SET preference_id = ?, updated_at = NOW() WHERE external_reference = ?",
            [(body && body.id) || null, external_reference],
          );
        } catch (upErr) {
          /* noop */
        }
        return res.json({ success: true, preference: body });
      }

      // Fallback a HTTP directo
      const url = "https://api.mercadopago.com/checkout/preferences";
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      });
      const body = await resp.json();
      try {
        await pool.query(
          "UPDATE Ordenes SET preference_id = ?, updated_at = NOW() WHERE external_reference = ?",
          [body.id || null, external_reference],
        );
      } catch (upErr) {
        /* noop */
      }
      return res.json({ success: true, preference: body });
    } catch (httpErr) {
      console.error("Error creando preferencia MP:", httpErr);
      return res
        .status(500)
        .json({ success: false, message: "Error creando preferencia (MP)" });
    }
  } catch (err) {
    console.error("Error creando preferencia MP:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error creando preferencia",
      });
  }
});

// GET /api/mercadopago/verify_payment?payment_id=...
router.get("/verify_payment", async (req, res) => {
  try {
    const paymentId =
      req.query.payment_id ||
      req.query.collection_id ||
      req.query.collection_id ||
      req.query.collection_id;
    if (!paymentId)
      return res
        .status(400)
        .json({ success: false, message: "payment_id es requerido" });
    if (!ACCESS_TOKEN)
      return res.status(400).json({
        success: false,
        message: "MP_ACCESS_TOKEN no configurado en backend",
      });

    const mpUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
    const mpResp = await fetch(mpUrl, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    const payment = await mpResp.json();
    if (!payment || payment.error || payment.message) {
      return res.status(404).json({
        success: false,
        message:
          "No se pudo obtener información del pago: " +
          (payment?.message || "Error desconocido"),
      });
    }

    const external_reference =
      payment.external_reference ||
      (payment.order && payment.order.external_reference) ||
      null;
    const status = mapPaymentToStatus(payment.status);
    const payer_email = payment.payer ? payment.payer.email : null;
    const payer_name = payment.payer
      ? payment.payer.first_name || payment.payer.id || ""
      : null;

    const pool = await getConnection();
    let affected = 0;
    if (external_reference) {
      const [upd] = await pool.query(
        "UPDATE Ordenes SET status = ?, payment_id = ?, preference_id = ?, payer_email = ?, payer_name = ?, updated_at = NOW() WHERE external_reference = ?",
        [
          status,
          payment.id || null,
          payment.preference_id || null,
          payer_email,
          String(payer_name).substring(0, 250),
          external_reference,
        ],
      );
      affected = upd && upd.affectedRows ? upd.affectedRows : 0;
    }
    // Si no encontramos por external_reference, intentar por preference_id
    if (!external_reference || affected === 0) {
      if (payment.preference_id) {
        await pool.query(
          "UPDATE Ordenes SET status = ?, payment_id = ?, payer_email = ?, payer_name = ?, updated_at = NOW() WHERE preference_id = ?",
          [
            status,
            payment.id || null,
            payer_email,
            String(payer_name).substring(0, 250),
            payment.preference_id,
          ],
        );
      }
    }

    // Devolver estado y datos del pago
    const [rows] = await pool.query(
      "SELECT * FROM Ordenes WHERE external_reference = ? OR preference_id = ? LIMIT 1",
      [external_reference || "", payment.preference_id || ""],
    );
    const order = rows && rows.length ? rows[0] : null;
    return res.json({ success: true, payment, order });
  } catch (err) {
    console.error("Error verificando pago:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error verificando pago",
      });
  }
});

// GET /api/mercadopago/order/:external_reference
router.get("/order/:external_reference", requireAdmin, async (req, res) => {
  try {
    const { external_reference } = req.params;
    const pool = await getConnection();
    const [rows] = await pool.query(
      "SELECT * FROM Ordenes WHERE external_reference = ? LIMIT 1",
      [external_reference],
    );
    if (!rows || rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Orden no encontrada" });
    return res.json({ success: true, order: rows[0] });
  } catch (err) {
    console.error("Error obteniendo orden:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error obteniendo orden",
      });
  }
});

// GET /api/mercadopago/orders?page=1&limit=20&status=approved
router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20")));
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const pool = await getConnection();
    const where = status ? "WHERE status = ?" : "";
    const paramsCount = status ? [status] : [];

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM Ordenes ${where}`,
      paramsCount,
    );
    const total =
      countRows && countRows[0] && countRows[0].total ? countRows[0].total : 0;

    const [rows] = await pool.query(
      `SELECT * FROM Ordenes ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...paramsCount, limit, offset],
    );
    return res.json({
      success: true,
      data: rows,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error listando ordenes:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error listando ordenes",
      });
  }
});

// PUT /api/mercadopago/order/:external_reference  -- actualizar estado manualmente
router.put("/order/:external_reference", requireAdmin, async (req, res) => {
  try {
    const { external_reference } = req.params;
    const { status } = req.body || {};
    const allowed = ["pending", "approved", "cancelled", "failed", "refunded"];
    if (!status || !allowed.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Estado inválido" });
    const pool = await getConnection();
    const [upd] = await pool.query(
      "UPDATE Ordenes SET status = ?, updated_at = NOW() WHERE external_reference = ?",
      [status, external_reference],
    );
    if (!upd || (upd && upd.affectedRows === 0))
      return res
        .status(404)
        .json({ success: false, message: "Orden no encontrada" });
    const [rows] = await pool.query(
      "SELECT * FROM Ordenes WHERE external_reference = ? LIMIT 1",
      [external_reference],
    );
    return res.json({
      success: true,
      order: rows && rows.length ? rows[0] : null,
    });
  } catch (err) {
    console.error("Error actualizando orden:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error actualizando orden",
      });
  }
});

// Webhook endpoint — procesa notificaciones desde Mercado Pago y actualiza órdenes
router.all("/webhook", async (req, res) => {
  try {
    console.log("[MP WEBHOOK] incoming headers:", {
      headers: req.headers,
      query: req.query,
    });

    // Verificación HMAC activa — requiere que MP_WEBHOOK_SECRET esté en el .env de Railway
    if (WEBHOOK_SECRET) {
      const headerCandidates = [
        "x-mercadopago-signature",
        "x-signature",
        "x-hub-signature-256",
        "x-mp-signature"
      ];
      let sigHeader = null;
      for (const h of headerCandidates) {
        if (req.headers[h]) {
          sigHeader = req.headers[h];
          break;
        }
      }

      if (!sigHeader) {
        console.warn("[MP WEBHOOK] signature header missing");
        return res.status(401).send("Signature required");
      }

      // Extraer v1 si viene en formato ts=...,v1=...
      let received = String(sigHeader);
      if (received.includes("v1=")) {
        const parts = received.split(",");
        const v1Part = parts.find(p => p.trim().startsWith("v1="));
        if (v1Part) received = v1Part.trim().substring(3);
      } else {
        const eqIdx = received.indexOf("=");
        if (eqIdx !== -1) received = received.slice(eqIdx + 1);
      }

      const payloadBuf =
        req.rawBody && req.rawBody.length
          ? req.rawBody
          : Buffer.from(JSON.stringify(req.body || {}));
      
      const expectedHex = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payloadBuf)
        .digest("hex");
      const expectedBase64 = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payloadBuf)
        .digest("base64");

      const recv = received.trim();
      const isHex = /^[0-9a-fA-F]+$/.test(recv);
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(recv);

      let verified = false;
      try {
        if (isHex) {
          const recvBuf = Buffer.from(recv, "hex");
          const expBuf = Buffer.from(expectedHex, "hex");
          if (recvBuf.length === expBuf.length && crypto.timingSafeEqual(recvBuf, expBuf)) verified = true;
        } 
        if (!verified && isBase64) {
          const recvBuf = Buffer.from(recv, "base64");
          const expBuf = Buffer.from(expectedBase64, "base64");
          if (recvBuf.length === expBuf.length && crypto.timingSafeEqual(recvBuf, expBuf)) verified = true;
        }
      } catch (ex) {
        console.error("[MP WEBHOOK] crypto error", ex.message);
      }

      if (!verified) {
        console.warn("[MP WEBHOOK] signature mismatch");
        return res.status(401).send("Invalid signature");
      }
    }
    
    const paymentId =
      req.body?.data?.id ||
      req.query?.id ||
      req.body?.id ||
      req.query?.payment_id ||
      req.body?.collection_id;
    if (!paymentId) return res.status(200).send("OK");
    if (!ACCESS_TOKEN) {
      console.log(
        "[MP WEBHOOK] MP_ACCESS_TOKEN no configurado — recibido id:",
        paymentId,
      );
      return res.status(200).send("OK");
    }

    const mpUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
    const mpResp = await fetch(mpUrl, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    const payment = await mpResp.json();
    console.log("[MP WEBHOOK] payment details:", payment);

    const external_reference =
      payment.external_reference ||
      (payment.order && payment.order.external_reference) ||
      null;
    const status = mapPaymentToStatus(payment.status);
    const payer_email = payment.payer ? payment.payer.email : null;
    const payer_name = payment.payer
      ? payment.payer.first_name || payment.payer.id || ""
      : null;

    const pool = await getConnection();
    if (external_reference) {
      await pool.query(
        "UPDATE Ordenes SET status = ?, payment_id = ?, preference_id = ?, payer_email = ?, payer_name = ?, updated_at = NOW() WHERE external_reference = ?",
        [
          status,
          payment.id || null,
          payment.preference_id || null,
          payer_email,
          String(payer_name).substring(0, 250),
          external_reference,
        ],
      );
    } else if (payment.preference_id) {
      await pool.query(
        "UPDATE Ordenes SET status = ?, payment_id = ?, payer_email = ?, payer_name = ?, updated_at = NOW() WHERE preference_id = ?",
        [
          status,
          payment.id || null,
          payer_email,
          String(payer_name).substring(0, 250),
          payment.preference_id,
        ],
      );
    }
    return res.status(200).send("OK");
  } catch (err) {
    console.error("[MP WEBHOOK] error procesando webhook:", err);
    return res.status(500).send("ERROR");
  }
});

module.exports = router;

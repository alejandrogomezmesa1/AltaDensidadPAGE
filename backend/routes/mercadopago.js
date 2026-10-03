const express = require("express");
const router = express.Router();
const { getConnection } = require("../config/db");
const { requireAuth, requireAdmin, requireStaff } = require("../middleware/auth");
let mercadopago;
try {
  mercadopago = require("mercadopago");
} catch (e) {
  /* optional */
}
const crypto = require("crypto");
const dataSync = require("../services/dataSync");
const esquema = require("../services/esquema");
const precios = require("../services/precios");

// Refleja en DATA el nuevo estado de la orden (venta o anulación). Nunca bloquea la respuesta.
function sincronizarConData(external_reference, preference_id) {
  const tarea = external_reference
    ? dataSync.sincronizarOrden(external_reference)
    : dataSync.sincronizarPorPreferencia(preference_id);
  tarea.catch((err) => console.error("[DATA] Error sincronizando orden:", err.message));
}

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

    const pool = await getConnection();
    const allowedShippingRates = [0, 15000, 20000, 22000];
    const mpItems = [];

    for (const it of items) {
      const qty = Math.max(1, Math.floor(Number(it.quantity || it.cantidad || 1)));
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, message: "Cantidad de producto inválida" });
      }

      const itemIdStr = String(it.id || "").trim();

      // 1. Validar item de envío
      if (itemIdStr === "envio-logistica" || itemIdStr.startsWith("envio-")) {
        const envioPrice = Number(it.unit_price || it.price || 0);
        if (!allowedShippingRates.includes(envioPrice)) {
          return res.status(400).json({ success: false, message: "Tarifa de envío no autorizada" });
        }
        mpItems.push({
          id: itemIdStr,
          title: String(it.name || it.title || "Servicio de Envío"),
          description: "Costo de entrega",
          picture_url: "",
          category_id: "shipping",
          quantity: 1,
          currency_id: "COP",
          unit_price: envioPrice,
        });
        continue;
      }

      // 2. Validar Kit
      if (itemIdStr.startsWith("kit_")) {
        const rawKitId = itemIdStr.replace("kit_", "");
        const kitId = parseInt(rawKitId, 10);
        if (isNaN(kitId)) {
          return res.status(400).json({ success: false, message: "ID de kit inválido" });
        }
        const [kRows] = await pool.query(`SELECT id, nombre, precio, imagen, activo${esquema.clasificacion() ? ", precio_revision" : ""} FROM Kits WHERE id = ?`, [kitId]);
        if (kRows.length === 0 || !kRows[0].activo) {
          return res.status(400).json({ success: false, message: `Kit no disponible o inactivo (ID: ${kitId})` });
        }
        const kit = kRows[0];
        if (kit.precio_revision) {
          return res.status(409).json({ success: false, message: `${kit.nombre} está en revisión de precio y no se puede comprar en este momento. Retíralo de tu bolsa o escríbenos por WhatsApp.` });
        }
        mpItems.push({
          id: itemIdStr,
          title: kit.nombre,
          description: it.description || "",
          picture_url: kit.imagen || it.picture_url || "",
          category_id: "kits",
          quantity: qty,
          currency_id: "COP",
          unit_price: Number(kit.precio),
        });
        continue;
      }

      // 3. Perfume armado ("Crea tu perfume"): arm_<productoId>_<ml>_<envaseId>_<0|1 feromonas>
      if (itemIdStr.startsWith("arm_")) {
        const [productoId, ml, envaseId, feromonas] = itemIdStr.slice(4).split("_").map((x) => parseInt(x, 10));
        if (![productoId, ml, envaseId].every((x) => x > 0) || ![0, 1].includes(feromonas)) {
          return res.status(400).json({ success: false, message: "Perfume armado inválido" });
        }
        try {
          const a = await precios.precioArmado(pool, { productoId, ml, envaseId, feromonas: feromonas === 1 });
          mpItems.push({
            id: itemIdStr, title: a.title, description: a.description, picture_url: a.picture_url,
            category_id: "fragancias", quantity: qty, currency_id: "COP", unit_price: a.unit_price,
          });
        } catch (e) {
          if (e instanceof precios.ErrorPrecio) return res.status(e.status).json({ success: false, message: e.message });
          throw e;
        }
        continue;
      }

      // 4. Insumo de DATA: ins_<inventarioId> o ins_<inventarioId>_<ml> (se vende por presentación)
      if (itemIdStr.startsWith("ins_")) {
        const [inventarioId, ml] = itemIdStr.slice(4).split("_").map((x) => parseInt(x, 10));
        if (!(inventarioId > 0)) return res.status(400).json({ success: false, message: "Insumo inválido" });
        try {
          const i = await precios.precioInsumo(pool, { inventarioId, ml });
          mpItems.push({
            id: itemIdStr, title: i.title, description: i.description, picture_url: i.picture_url,
            category_id: "insumos", quantity: qty, currency_id: "COP", unit_price: i.unit_price,
            // Solo para DATA (no viajan a Mercado Pago): cantidad y precio en la unidad del inventario
            inventario_id: i.inventario_id,
            ...(i.data_por_unidad ? { data_cantidad: qty * i.data_por_unidad, data_precio: i.data_precio } : {}),
          });
        } catch (e) {
          if (e instanceof precios.ErrorPrecio) return res.status(e.status).json({ success: false, message: e.message });
          throw e;
        }
        continue;
      }

      // 5. Validar Perfume / Producto general
      const prodId = parseInt(itemIdStr, 10);
      if (isNaN(prodId)) {
        return res.status(400).json({ success: false, message: `ID de producto inválido: ${itemIdStr}` });
      }
      const [pRows] = await pool.query(`SELECT id, nombre, precio, imagen, activo${esquema.clasificacion() ? ", precio_revision" : ""}${esquema.soloPreparado() ? ", solo_preparado" : ""} FROM Productos WHERE id = ?`, [prodId]);
      if (pRows.length === 0 || !pRows[0].activo) {
        return res.status(400).json({ success: false, message: `Producto no disponible o inactivo (ID: ${prodId})` });
      }
      const prod = pRows[0];
      if (prod.solo_preparado) {
        return res.status(409).json({ success: false, message: `${prod.nombre} solo se vende preparado: créalo en "Crea tu perfume" eligiendo envase y tamaño.` });
      }
      if (prod.precio_revision) {
        return res.status(409).json({ success: false, message: `${prod.nombre} está en revisión de precio y no se puede comprar en este momento. Retíralo de tu bolsa o escríbenos por WhatsApp.` });
      }
      mpItems.push({
        id: String(prod.id),
        title: prod.nombre,
        description: it.description || "",
        picture_url: prod.imagen || it.picture_url || "",
        category_id: it.category || "fragancias",
        quantity: qty,
        currency_id: "COP",
        unit_price: Number(prod.precio),
      });
    }

    // Nada se cobra en $0: un precio vacío o en 0 en el panel no puede convertirse en un regalo
    const sinPrecio = mpItems.filter((it) => it.category_id !== "shipping" && !(Number(it.unit_price) > 0));
    if (sinPrecio.length) {
      return res.status(409).json({
        success: false,
        message: `${sinPrecio.map((it) => it.title).join(", ")} aún no tiene precio en línea. Retíralo de tu bolsa o escríbenos por WhatsApp.`,
      });
    }

    // Verificar disponibilidad real en DATA antes de cobrar
    try {
      const sinStock = await dataSync.verificarDisponibilidad(pool, mpItems);
      if (sinStock.length) {
        return res.status(409).json({
          success: false,
          message: `Lo sentimos, ${sinStock.join(", ")} ${sinStock.length > 1 ? "están agotados" : "está agotado"} en este momento. Retíralo de tu bolsa para continuar.`,
        });
      }
    } catch (stockErr) {
      console.warn("[DATA] No se pudo verificar disponibilidad:", stockErr.message);
    }

    // Calcular total oficial basado exclusivamente en la base de datos
    const total = mpItems.reduce(
      (s, it) => s + Number(it.unit_price || 0) * Number(it.quantity || 0),
      0,
    );
    const external_reference =
      "ORD" + Date.now() + Math.floor(Math.random() * 9000 + 1000);
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
      // Los campos internos para DATA no viajan a Mercado Pago
      items: mpItems.map(({ inventario_id, data_cantidad, data_precio, ...it }) => it),
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

    sincronizarConData(external_reference, payment.preference_id);

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
router.get("/order/:external_reference", requireStaff, async (req, res) => {
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
router.get("/orders", requireStaff, async (req, res) => {
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
router.put("/order/:external_reference", requireStaff, async (req, res) => {
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
    sincronizarConData(external_reference);
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

// Verifica la cabecera x-signature de Mercado Pago (esquema oficial de Webhooks)
function firmaMercadoPagoValida(req) {
  const cabecera = String(req.headers["x-signature"] || "");
  const partes = Object.fromEntries(cabecera.split(",").map((p) => p.trim().split("=").map((x) => x.trim())).filter((p) => p.length === 2));
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1 || !/^[0-9a-f]+$/i.test(v1)) return false;
  let dataId = String(req.query["data.id"] || (req.body && req.body.data && req.body.data.id) || "");
  if (/^[a-z0-9]+$/i.test(dataId)) dataId = dataId.toLowerCase();
  const requestId = req.headers["x-request-id"];
  let manifiesto = "";
  if (dataId) manifiesto += `id:${dataId};`;
  if (requestId) manifiesto += `request-id:${requestId};`;
  manifiesto += `ts:${ts};`;
  const esperada = crypto.createHmac("sha256", WEBHOOK_SECRET).update(manifiesto).digest();
  const recibida = Buffer.from(v1, "hex");
  return recibida.length === esperada.length && crypto.timingSafeEqual(recibida, esperada);
}

// Webhook endpoint — procesa notificaciones desde Mercado Pago y actualiza órdenes
router.all("/webhook", async (req, res) => {
  try {
    console.log("[MP WEBHOOK] incoming headers:", {
      headers: req.headers,
      query: req.query,
    });

    // Firma de Mercado Pago (MP_WEBHOOK_SECRET = "clave secreta" de la sección Webhooks del panel de MP).
    // MP no firma el cuerpo: firma el texto "id:{data.id};request-id:{x-request-id};ts:{ts};"
    // y lo envía en x-signature como "ts=…,v1=…". Aun sin firma, el estado del pago siempre se
    // consulta a la API de MP con el token, así que una notificación falsa no puede aprobar nada.
    if (WEBHOOK_SECRET && !firmaMercadoPagoValida(req)) {
      console.warn("[MP WEBHOOK] firma inválida o ausente");
      return res.status(401).send("Invalid signature");
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
    sincronizarConData(external_reference, payment.preference_id);
    return res.status(200).send("OK");
  } catch (err) {
    console.error("[MP WEBHOOK] error procesando webhook:", err);
    return res.status(500).send("ERROR");
  }
});

module.exports = router;

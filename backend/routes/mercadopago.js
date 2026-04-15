const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
let mercadopago;
try { mercadopago = require('mercadopago'); } catch (e) { /* optional */ }
const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SIGNATURE || null;

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;
const FORCE_MOCK = (String(process.env.MP_FORCE_MOCK || '').toLowerCase() === '1' || String(process.env.MP_FORCE_MOCK || '').toLowerCase() === 'true');

function mapPaymentToStatus(paymentStatus) {
    if (!paymentStatus) return 'pending';
    const s = String(paymentStatus).toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'in_process' || s === 'pending') return 'pending';
    if (s === 'cancelled' || s === 'rejected' || s === 'refunded' ) return 'failed';
    return 'pending';
}

// POST /api/mercadopago/create_preference
router.post('/create_preference', async (req, res) => {
    try {
        const { items, payer } = req.body || {};
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'La lista de items es requerida' });
        }

        const mpItems = items.map(it => ({
            id: String(it.id || ''),
            title: String(it.name || it.title || 'Producto'),
            description: it.description || '',
            picture_url: it.image || it.picture_url || '',
            category_id: it.category || 'general',
            quantity: Number(it.quantity || it.cantidad || 1),
            currency_id: it.currency || 'COP',
            unit_price: Number(it.price || it.unit_price || 0)
        }));

        // Calcular total y crear orden en DB
        const total = mpItems.reduce((s, it) => s + (Number(it.unit_price || 0) * Number(it.quantity || 0)), 0);
        const external_reference = 'ORD' + Date.now() + Math.floor(Math.random() * 9000 + 1000);
        const pool = await getConnection();
        try {
            await pool.query(
                'INSERT INTO Ordenes (external_reference, items, total, currency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [external_reference, JSON.stringify(mpItems), total, 'COP', 'pending']
            );
        } catch (dbErr) {
            console.warn('No se pudo insertar orden (verifique la tabla Ordenes):', dbErr.message || dbErr);
        }

        // Prefer explicit FRONTEND_URL, otherwise detect scheme. For common PaaS (railway/vercel) prefer https.
        const preferHttpsHosts = /railway\.app|vercel\.app|ngrok\.io|localhost/;
        const protocol = (process.env.FORCE_HTTPS === '1' || preferHttpsHosts.test(req.get('host') || '')) ? 'https' : req.protocol;
        const hostBase = process.env.FRONTEND_URL || `${protocol}://${req.get('host')}`;
        const preference = {
            items: mpItems,
            payer: payer || undefined,
            external_reference,
            back_urls: {
                success: `${hostBase}/success.html`,
                failure: `${hostBase}/failure.html`,
                pending: `${hostBase}/pending.html`
            },
            auto_return: 'approved',
            notification_url: process.env.MP_NOTIFICATION_URL || `${req.protocol}://${req.get('host')}/api/mercadopago/webhook`
        };

        // Si no hay token o se fuerza mock, devolver preferencia mock
        if (!ACCESS_TOKEN || FORCE_MOCK) {
            const mockId = 'mock_pref_' + Date.now();
            const mockPref = {
                id: mockId,
                init_point: `${hostBase}/_mock_mp_checkout.html?pref_id=${mockId}&external_reference=${external_reference}`,
                sandbox_init_point: `${hostBase}/_mock_mp_checkout.html?pref_id=${mockId}&external_reference=${external_reference}`,
                items: mpItems,
                external_reference
            };
            const msg = !ACCESS_TOKEN ? 'MP_ACCESS_TOKEN no configurado — se devuelve preferencia mock para desarrollo local' : 'MP_FORCE_MOCK activado — se devuelve preferencia mock para pruebas';
            return res.json({ success: true, preference: mockPref, mock: true, message: msg });
        }

        // Crear preferencia: preferiblemente usar SDK `mercadopago`, con fallback HTTP
        try {
            // Intentar via SDK si está disponible
            if (mercadopago && typeof mercadopago.preferences !== 'undefined') {
                try {
                    if (mercadopago.configurations && typeof mercadopago.configurations.setAccessToken === 'function') {
                        mercadopago.configurations.setAccessToken(ACCESS_TOKEN);
                    } else if (typeof mercadopago.configure === 'function') {
                        mercadopago.configure({ access_token: ACCESS_TOKEN });
                    }
                } catch (cfgErr) {
                    console.warn('No se pudo configurar SDK mercadopago:', cfgErr && cfgErr.message);
                }

                const mpResp = await mercadopago.preferences.create(preference);
                const body = (mpResp && (mpResp.body || mpResp)) ? (mpResp.body || mpResp) : mpResp;
                // Guardar preference_id en la orden si es posible
                try { await pool.query('UPDATE Ordenes SET preference_id = ?, updated_at = NOW() WHERE external_reference = ?', [body && body.id || null, external_reference]); } catch (upErr) { /* noop */ }
                return res.json({ success: true, preference: body });
            }

            // Fallback a HTTP directo
            const url = 'https://api.mercadopago.com/checkout/preferences';
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                },
                body: JSON.stringify(preference)
            });
            const body = await resp.json();
            try { await pool.query('UPDATE Ordenes SET preference_id = ?, updated_at = NOW() WHERE external_reference = ?', [body.id || null, external_reference]); } catch (upErr) { /* noop */ }
            return res.json({ success: true, preference: body });
        } catch (httpErr) {
            console.error('Error creando preferencia MP:', httpErr);
            return res.status(500).json({ success: false, message: 'Error creando preferencia (MP)' });
        }
    } catch (err) {
        console.error('Error creando preferencia MP:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error creando preferencia' });
    }
});

// GET /api/mercadopago/verify_payment?payment_id=...
router.get('/verify_payment', async (req, res) => {
    try {
        const paymentId = req.query.payment_id || req.query.collection_id || req.query.collection_id || req.query.collection_id;
        if (!paymentId) return res.status(400).json({ success: false, message: 'payment_id es requerido' });
        if (!ACCESS_TOKEN) return res.status(400).json({ success: false, message: 'MP_ACCESS_TOKEN no configurado en backend' });

        const mpUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
        const mpResp = await fetch(mpUrl, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } });
        const payment = await mpResp.json();
        if (!payment) return res.status(500).json({ success: false, message: 'No se pudo obtener información del pago' });

        const external_reference = payment.external_reference || (payment.order && payment.order.external_reference) || null;
        const status = mapPaymentToStatus(payment.status);

        const pool = await getConnection();
        let affected = 0;
        if (external_reference) {
            const [upd] = await pool.query('UPDATE Ordenes SET status = ?, payment_id = ?, preference_id = ?, updated_at = NOW() WHERE external_reference = ?', [status, payment.id || null, payment.preference_id || null, external_reference]);
            affected = upd && upd.affectedRows ? upd.affectedRows : 0;
        }
        // Si no encontramos por external_reference, intentar por preference_id
        if (!external_reference || affected === 0) {
            if (payment.preference_id) {
                await pool.query('UPDATE Ordenes SET status = ?, payment_id = ?, updated_at = NOW() WHERE preference_id = ?', [status, payment.id || null, payment.preference_id]);
            }
        }

        // Devolver estado y datos del pago
        const [rows] = await pool.query('SELECT * FROM Ordenes WHERE external_reference = ? OR preference_id = ? LIMIT 1', [external_reference || '', payment.preference_id || '']);
        const order = rows && rows.length ? rows[0] : null;
        return res.json({ success: true, payment, order });
    } catch (err) {
        console.error('Error verificando pago:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error verificando pago' });
    }
});

// GET /api/mercadopago/order/:external_reference
router.get('/order/:external_reference', requireAdmin, async (req, res) => {
    try {
        const { external_reference } = req.params;
        const pool = await getConnection();
        const [rows] = await pool.query('SELECT * FROM Ordenes WHERE external_reference = ? LIMIT 1', [external_reference]);
        if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        return res.json({ success: true, order: rows[0] });
    } catch (err) {
        console.error('Error obteniendo orden:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error obteniendo orden' });
    }
});

// GET /api/mercadopago/orders?page=1&limit=20&status=approved
router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20')));
        const offset = (page - 1) * limit;
        const status = req.query.status;

        const pool = await getConnection();
        const where = status ? 'WHERE status = ?' : '';
        const paramsCount = status ? [status] : [];

        const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM Ordenes ${where}`, paramsCount);
        const total = (countRows && countRows[0] && countRows[0].total) ? countRows[0].total : 0;

        const [rows] = await pool.query(`SELECT * FROM Ordenes ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...paramsCount, limit, offset]);
        return res.json({ success: true, data: rows, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        console.error('Error listando ordenes:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error listando ordenes' });
    }
});

// PUT /api/mercadopago/order/:external_reference  -- actualizar estado manualmente
router.put('/order/:external_reference', requireAdmin, async (req, res) => {
    try {
        const { external_reference } = req.params;
        const { status } = req.body || {};
        const allowed = ['pending', 'approved', 'cancelled', 'failed', 'refunded'];
        if (!status || !allowed.includes(status)) return res.status(400).json({ success: false, message: 'Estado inválido' });
        const pool = await getConnection();
        const [upd] = await pool.query('UPDATE Ordenes SET status = ?, updated_at = NOW() WHERE external_reference = ?', [status, external_reference]);
        if (!upd || (upd && upd.affectedRows === 0)) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        const [rows] = await pool.query('SELECT * FROM Ordenes WHERE external_reference = ? LIMIT 1', [external_reference]);
        return res.json({ success: true, order: rows && rows.length ? rows[0] : null });
    } catch (err) {
        console.error('Error actualizando orden:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error actualizando orden' });
    }
});

// Webhook endpoint — procesa notificaciones desde Mercado Pago y actualiza órdenes
router.post('/webhook', async (req, res) => {
    try {
        console.log('[MP WEBHOOK] incoming headers:', { headers: req.headers, query: req.query });

        // Verificación HMAC opcional — si `WEBHOOK_SECRET` está configurada
        if (WEBHOOK_SECRET) {
            const headerCandidates = [
                'x-hub-signature-256',
                'x-hub-signature',
                'x-mercadopago-signature',
                'x-mp-signature',
                'x-signature',
                'x-platform-webhooks-signature'
            ];
            let sigHeader = null;
            for (const h of headerCandidates) {
                if (req.headers[h]) { sigHeader = req.headers[h]; break; }
            }
            if (!sigHeader) {
                console.warn('[MP WEBHOOK] signature header missing');
                return res.status(401).send('Signature required');
            }
            let received = String(sigHeader);
            const eqIdx = received.indexOf('=');
            if (eqIdx !== -1) received = received.slice(eqIdx + 1);
            const payloadBuf = (req.rawBody && req.rawBody.length) ? req.rawBody : Buffer.from(JSON.stringify(req.body || {}));
            // Compute expected HMAC in both hex and base64 to accept either format
            const expectedHex = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadBuf).digest('hex');
            const expectedBase64 = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadBuf).digest('base64');

            // Normalize received signature (could be hex or base64, may include prefix like 'sha256=')
            const normalize = (s) => String(s).trim();
            const recv = normalize(received);

            const isHex = /^[0-9a-fA-F]+$/.test(recv);
            const isBase64 = /^[A-Za-z0-9+/=]+$/.test(recv);

            try {
                if (isHex) {
                    const recvBuf = Buffer.from(recv, 'hex');
                    const expBuf = Buffer.from(expectedHex, 'hex');
                    if (recvBuf.length !== expBuf.length || !crypto.timingSafeEqual(recvBuf, expBuf)) {
                        console.warn('[MP WEBHOOK] signature mismatch (hex)');
                        return res.status(401).send('Invalid signature');
                    }
                } else if (isBase64) {
                    const recvBuf = Buffer.from(recv, 'base64');
                    const expBuf = Buffer.from(expectedBase64, 'base64');
                    if (recvBuf.length !== expBuf.length || !crypto.timingSafeEqual(recvBuf, expBuf)) {
                        console.warn('[MP WEBHOOK] signature mismatch (base64)');
                        return res.status(401).send('Invalid signature');
                    }
                } else {
                    // Fallback: compare raw strings (timing safe)
                    const expHexBuf = Buffer.from(expectedHex, 'utf8');
                    const recvBuf = Buffer.from(recv, 'utf8');
                    if (recvBuf.length !== expHexBuf.length || !crypto.timingSafeEqual(recvBuf, expHexBuf)) {
                        console.warn('[MP WEBHOOK] signature format unknown or mismatch');
                        return res.status(401).send('Invalid signature format');
                    }
                }
            } catch (ex) {
                console.warn('[MP WEBHOOK] signature parse error', ex && ex.message);
                return res.status(401).send('Invalid signature format');
            }
        } else {
            console.log('[MP WEBHOOK] WEBHOOK_SECRET not configured — skipping signature verification');
        }

        const paymentId = req.body?.data?.id || req.query?.id || req.body?.id || req.query?.payment_id || req.body?.collection_id;
        if (!paymentId) return res.status(200).send('OK');
        if (!ACCESS_TOKEN) {
            console.log('[MP WEBHOOK] MP_ACCESS_TOKEN no configurado — recibido id:', paymentId);
            return res.status(200).send('OK');
        }

        const mpUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
        const mpResp = await fetch(mpUrl, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } });
        const payment = await mpResp.json();
        console.log('[MP WEBHOOK] payment details:', payment);

        const external_reference = payment.external_reference || (payment.order && payment.order.external_reference) || null;
        const status = mapPaymentToStatus(payment.status);
        const pool = await getConnection();
        if (external_reference) {
            await pool.query('UPDATE Ordenes SET status = ?, payment_id = ?, preference_id = ?, updated_at = NOW() WHERE external_reference = ?', [status, payment.id || null, payment.preference_id || null, external_reference]);
        } else if (payment.preference_id) {
            await pool.query('UPDATE Ordenes SET status = ?, payment_id = ?, updated_at = NOW() WHERE preference_id = ?', [status, payment.id || null, payment.preference_id]);
        }
        return res.status(200).send('OK');
    } catch (err) {
        console.error('[MP WEBHOOK] error procesando webhook:', err);
        return res.status(500).send('ERROR');
    }
});

module.exports = router;

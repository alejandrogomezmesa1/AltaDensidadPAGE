const express = require('express');
const router = express.Router();
let mercadopago;
try {
    mercadopago = require('mercadopago');
} catch (e) {
    console.warn('Paquete mercadopago no está instalado. Instálalo con `npm i mercadopago` en el backend.');
}

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;
if (mercadopago && ACCESS_TOKEN) {
    try { mercadopago.configure({ access_token: ACCESS_TOKEN }); } catch (err) { console.warn('Error configurando MercadoPago:', err.message); }
} else if (mercadopago) {
    console.warn('MercadoPago: no se encontró variable de entorno MP_ACCESS_TOKEN.');
}

// POST /api/mercadopago/create_preference
router.post('/create_preference', async (req, res) => {
    try {
        const { items, payer } = req.body || {};
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'La lista de items es requerida' });
        }
        if (!mercadopago) return res.status(500).json({ success:false, message: 'SDK MercadoPago no disponible en el servidor' });

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

        const hostBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
        const preference = {
            items: mpItems,
            payer: payer || undefined,
            back_urls: {
                success: `${hostBase}/success.html`,
                failure: `${hostBase}/failure.html`,
                pending: `${hostBase}/pending.html`
            },
            auto_return: 'approved',
            notification_url: process.env.MP_NOTIFICATION_URL || `${req.protocol}://${req.get('host')}/api/mercadopago/webhook`
        };

        const mpRes = await mercadopago.preferences.create(preference);
        return res.json({ success: true, preference: mpRes.body });
    } catch (err) {
        console.error('Error creando preferencia MP:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error creando preferencia' });
    }
});

// Webhook endpoint (simple logging)
router.post('/webhook', (req, res) => {
    console.log('[MP WEBHOOK]', req.method, req.path, req.body || req.query);
    // Aquí se pueden procesar notificaciones (actualizar ordenes, etc.)
    res.status(200).send('OK');
});

module.exports = router;

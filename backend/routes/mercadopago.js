const express = require('express');
const router = express.Router();
let mercadopago;
try {
    mercadopago = require('mercadopago');
} catch (e) {
    console.warn('Paquete mercadopago no está instalado. Instálalo con `npm i mercadopago` en el backend.');
}

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;
// Detectar si la SDK exporta la API esperada (preferences.create)
const useSdk = Boolean(mercadopago && typeof mercadopago.preferences === 'object' && typeof mercadopago.preferences.create === 'function');
if (useSdk && ACCESS_TOKEN) {
    // Solo configurar si la función existe
    try {
        if (typeof mercadopago.configure === 'function') {
            mercadopago.configure({ access_token: ACCESS_TOKEN });
        }
    } catch (err) {
        console.warn('Error configurando MercadoPago:', err && err.message ? err.message : err);
    }
} else if (mercadopago && !useSdk) {
    console.warn('MercadoPago: SDK cargada pero no tiene la API esperada. Usando fallback HTTP cuando sea necesario.');
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

        // Si no hay token de Mercado Pago en entorno, devolver una preferencia mock
        if (!ACCESS_TOKEN) {
            const mockId = 'mock_pref_' + Date.now();
            const mockPref = {
                id: mockId,
                init_point: `${hostBase}/_mock_mp_checkout.html?pref_id=${mockId}`,
                sandbox_init_point: `${hostBase}/_mock_mp_checkout.html?pref_id=${mockId}`,
                items: mpItems
            };
            return res.json({ success: true, preference: mockPref, mock: true, message: 'MP_ACCESS_TOKEN no configurado — se devuelve preferencia mock para desarrollo local' });
        }

        const mpRes = await mercadopago.preferences.create(preference);
        return res.json({ success: true, preference: mpRes.body });
    } catch (err) {
        console.error('Error creando preferencia MP:', err);
        return res.status(500).json({ success: false, message: err.message || 'Error creando preferencia' });
    }
});

// Webhook endpoint (simple logging)
router.post('/webhook', async (req, res) => {
    try {
        console.log('[MP WEBHOOK] incoming:', { body: req.body, query: req.query });

        // Mercado Pago puede enviar id en varios lugares. Soportamos los casos comunes
        const paymentId = req.body?.data?.id || req.query?.id || req.body?.id || req.query?.payment_id;
        const topic = req.body?.topic || req.query?.topic || req.body?.type;

        if (!paymentId) {
                // Si la SDK está disponible y tiene la función, úsala; si no, usar el endpoint HTTP
                if (useSdk && mercadopago && typeof mercadopago.preferences.create === 'function') {
                    const mpRes = await mercadopago.preferences.create(preference);
                    return res.json({ success: true, preference: mpRes.body });
                }

                // Fallback HTTP a la API de Mercado Pago
                try {
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
                    return res.json({ success: true, preference: body });
                } catch (httpErr) {
                    console.error('Error creando preferencia via HTTP MP:', httpErr);
                    return res.status(500).json({ success: false, message: 'Error creando preferencia (HTTP)' });
                }
            return res.status(200).send('OK');
        }

        if (!ACCESS_TOKEN) {
            console.log('[MP WEBHOOK] MP_ACCESS_TOKEN no configurado — recibido id:', paymentId);
            return res.status(200).send('OK');
        }

        // Fetch details del pago desde la API de Mercado Pago (usa Bearer token)
        const mpUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
        const mpResp = await fetch(mpUrl, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } });
        const payment = await mpResp.json();
        console.log('[MP WEBHOOK] payment details:', payment);

        // TODO: Mapear payment.external_reference o metadata a una orden en la base de datos
        // Ejemplo: buscar order por `external_reference` y actualizar estado según payment.status

        return res.status(200).send('OK');
    } catch (err) {
        console.error('[MP WEBHOOK] error procesando webhook:', err);
        return res.status(500).send('ERROR');
    }
});

module.exports = router;

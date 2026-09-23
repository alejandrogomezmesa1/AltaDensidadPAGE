const express = require('express');
const router = express.Router();

// Proxy seguro hacia el servicio del chatbot (api.py).
// La API key NUNCA llega al frontend: vive en variables de entorno del backend.
// Configurar en .env (o en el panel de Railway):
//   CHATBOT_API_URL=https://tu-api-del-chatbot...  (base, sin /chat)
//   CHATBOT_API_KEY=pk-...
const CHATBOT_API_URL = (process.env.CHATBOT_API_URL || '').replace(/\/+$/, '');
const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || '';
const CHATBOT_TIMEOUT_MS = parseInt(process.env.CHATBOT_TIMEOUT_MS || '120000', 10);

// POST /api/chatbot  ->  POST {CHATBOT_API_URL}/chat
router.post('/', async (req, res) => {
    if (!CHATBOT_API_URL || !CHATBOT_API_KEY) {
        return res.status(503).json({
            success: false,
            message: 'El asistente no está configurado en el servidor (faltan CHATBOT_API_URL / CHATBOT_API_KEY).'
        });
    }

    const { message, session_id } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Debes enviar un mensaje.' });
    }

    const payload = { message: message.trim() };
    if (session_id) payload.session_id = session_id;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHATBOT_TIMEOUT_MS);

    try {
        const upstream = await fetch(`${CHATBOT_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CHATBOT_API_KEY}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            return res.status(upstream.status).json({
                success: false,
                message: `Error del chatbot (${upstream.status})`,
                detail: text.slice(0, 300)
            });
        }

        const data = await upstream.json();
        res.json({
            success: true,
            session_id: data.session_id,
            response: data.response,
            res_type: data.res_type
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            return res.status(504).json({ success: false, message: 'El asistente tardó demasiado en responder.' });
        }
        console.error('Error en proxy /api/chatbot:', err.message || err);
        return res.status(502).json({ success: false, message: 'No se pudo contactar al asistente.' });
    } finally {
        clearTimeout(timer);
    }
});

module.exports = router;

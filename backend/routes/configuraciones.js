// Módulo Configuraciones del panel de la tienda. Las configuraciones del inventario (semáforo de
// stock…) viven en DATA: este backend las lee y las guarda por la integración privada, así que se
// pueden cambiar desde cualquiera de los dos paneles y siempre valen lo mismo.
const express = require('express');
const router = express.Router();
const { requireStaff, requireAdmin } = require('../middleware/auth');
const bridge = require('../services/dataBridge');

// El mensaje de DATA viene como "DATA respondió 400: …": al panel solo le sirve el motivo
const motivo = (err) => String(err.message || '').replace(/^DATA respondió \d+: /, '');

// GET /api/admin/configuraciones
router.get('/', requireStaff, async (req, res) => {
    if (!bridge.habilitado()) {
        return res.json({ success: true, data: { disponible: false, definiciones: [], valores: {} } });
    }
    try {
        const r = await bridge.obtenerConfiguraciones();
        res.json({ success: true, data: { disponible: true, definiciones: r.definiciones || [], valores: r.valores || {} } });
    } catch (err) {
        console.error('[DATA] Error leyendo configuraciones:', err.message);
        res.status(502).json({ success: false, message: 'No se pudieron leer las configuraciones de DATA: ' + motivo(err) });
    }
});

// PUT /api/admin/configuraciones — { valores: { clave: valor } }
router.put('/', requireAdmin, async (req, res) => {
    if (!bridge.habilitado()) return res.status(503).json({ success: false, message: 'Integración con DATA no configurada' });
    try {
        const r = await bridge.guardarConfiguraciones((req.body || {}).valores || {});
        res.json({ success: true, data: { disponible: true, definiciones: r.definiciones || [], valores: r.valores || {} } });
    } catch (err) {
        const status = /respondió 4\d\d/.test(err.message) ? 400 : 502;
        res.status(status).json({ success: false, message: motivo(err) });
    }
});

module.exports = router;

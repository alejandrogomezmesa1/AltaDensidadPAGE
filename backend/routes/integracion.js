// Endpoints de administración de la integración con DATA.
// El panel solo habla con este backend; DATA nunca queda expuesto al navegador.
const express = require('express');
const router = express.Router();
const { requireStaff, requireAdmin } = require('../middleware/auth');
const bridge = require('../services/dataBridge');
const dataSync = require('../services/dataSync');

// GET /api/admin/integracion/estado
router.get('/estado', requireStaff, async (req, res) => {
    try {
        res.json({ success: true, data: await dataSync.resumen() });
    } catch (err) {
        console.error('[DATA] Error obteniendo estado:', err.message);
        res.status(500).json({ success: false, message: 'No se pudo obtener el estado de la integración' });
    }
});

// GET /api/admin/integracion/inventario — para enlazar productos/kits con DATA
router.get('/inventario', requireStaff, async (req, res) => {
    if (!bridge.habilitado()) {
        return res.status(503).json({ success: false, message: 'Integración con DATA no configurada' });
    }
    try {
        const data = await bridge.obtenerInventario();
        data.sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
        res.json({ success: true, data });
    } catch (err) {
        console.error('[DATA] Error obteniendo inventario:', err.message);
        res.status(502).json({ success: false, message: 'No se pudo consultar el inventario de DATA' });
    }
});

// POST /api/admin/integracion/sincronizar — fuerza un ciclo completo
router.post('/sincronizar', requireAdmin, async (req, res) => {
    if (!bridge.habilitado()) {
        return res.status(503).json({ success: false, message: 'Integración con DATA no configurada' });
    }
    await dataSync.ciclo();
    res.json({ success: true, data: await dataSync.resumen() });
});

module.exports = router;

// Endpoints de administración de la integración con DATA.
// El panel solo habla con este backend; DATA nunca queda expuesto al navegador.
const express = require('express');
const router = express.Router();
const { requireStaff, requireAdmin } = require('../middleware/auth');
const bridge = require('../services/dataBridge');
const dataSync = require('../services/dataSync');
const { getConnection } = require('../config/db');

// Regla de respaldo (la de DATA del 24-10-2026) por si DATA no responde: sin piso de costo
const REGLA_RESPALDO = { lowUpTo: 75000, lowDiscount: 10000, midUpTo: 95000, midDiscount: 15000, highDiscount: 20000, minMarginPct: 15 };
const segunRegla = (precio, r) => precio - (precio <= r.lowUpTo ? r.lowDiscount : precio <= r.midUpTo ? r.midDiscount : r.highDiscount);

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

// GET /api/admin/integracion/precios-mayoristas — lo que le cuesta cada producto y kit al mayorista.
// { verificado, motivo?, regla, productos: { id: { mayorista, fuera, alPiso, sinCosto } }, kits: { … } }
// Sin DATA se calcula con la regla de respaldo y verificado = false (no se pudo comparar con el costo).
router.get('/precios-mayoristas', requireStaff, async (req, res) => {
    try {
        const pool = await getConnection();
        const [productos] = await pool.query('SELECT id, precio, inventario_id FROM Productos');
        const [kits] = await pool.query('SELECT id, precio, inventario_id FROM Kits');
        let porInventario = null;
        let regla = REGLA_RESPALDO;
        let motivo = null;
        if (bridge.habilitado()) {
            try {
                const r = await bridge.obtenerPreciosMayoristas();
                regla = r.rule || regla;
                porInventario = new Map((r.items || []).map((x) => [Number(x.inventoryId), x]));
            } catch (err) {
                motivo = /404/.test(err.message) ? 'DATA aún no tiene el cálculo mayorista (falta desplegar)' : err.message;
            }
        } else motivo = 'Integración con DATA no configurada';
        const calcular = (filas) => Object.fromEntries(filas.map((f) => {
            const precio = Number(f.precio) || 0;
            const d = porInventario && f.inventario_id ? porInventario.get(Number(f.inventario_id)) : null;
            if (d) return [f.id, { mayorista: d.wholesalePrice, fuera: !!d.excluded, alPiso: !!d.atFloor, sinCosto: !!d.noCost }];
            // Sin dato de DATA (no enlazado o DATA caído): la regla sin piso de costo
            return [f.id, { mayorista: precio > 0 ? Math.max(0, segunRegla(precio, regla)) : null, fuera: !(precio > 0), alPiso: false, sinCosto: true }];
        }));
        res.json({ success: true, data: { verificado: !!porInventario, motivo, regla, productos: calcular(productos), kits: calcular(kits) } });
    } catch (err) {
        console.error('[DATA] Error obteniendo precios mayoristas:', err.message);
        res.status(500).json({ success: false, message: 'No se pudieron calcular los precios mayoristas' });
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

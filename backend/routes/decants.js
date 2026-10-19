// Decants: catálogo público y administración (precios, envases, sets y enlace fragancia ↔ esencia)
const express = require('express');
const { getConnection } = require('../config/db');
const { requireStaff } = require('../middleware/auth');
const esquema = require('../services/esquema');
const decants = require('../services/decants');
const { CATEGORIAS, numeroONulo } = require('../services/precios');

const publico = express.Router();
const admin = express.Router();

const sinEsquema = (res) => res.status(503).json({ success: false, message: 'Los decants aún no están listos (migración 013 pendiente).' });
const fallo = (res, err, msg) => {
    console.error('[DECANTS]', msg, err.message);
    res.status(500).json({ success: false, message: msg });
};
const precioValido = (v) => v === null || (Number.isInteger(v) && v > 0 && v <= 10000000);
const texto = (v, max) => (v == null || String(v).trim() === '' ? null : String(v).trim().substring(0, max));

// GET /api/decants — envases, sets y fragancias disponibles en decant
publico.get('/', async (req, res) => {
    if (!esquema.decants()) return sinEsquema(res);
    try {
        const pool = await getConnection();
        res.json({ success: true, data: await decants.catalogo(pool) });
    } catch (err) { fallo(res, err, 'No se pudo leer el catálogo de decants'); }
});

// GET /api/admin/decants — configuración, esencias de DATA y enlaces con sugerencias
admin.get('/', requireStaff, async (req, res) => {
    if (!esquema.decants()) return sinEsquema(res);
    try {
        const pool = await getConnection();
        res.json({ success: true, data: await decants.resumenAdmin(pool) });
    } catch (err) { fallo(res, err, 'No se pudo leer la configuración de decants'); }
});

// PUT /api/admin/decants — { precios: { Arabe, Diseñador }, envases: [...], sets: [...] }
admin.put('/', requireStaff, async (req, res) => {
    if (!esquema.decants()) return sinEsquema(res);
    const { precios = {}, envases = [], sets = [] } = req.body || {};
    for (const c of CATEGORIAS) {
        if (c in precios && !precioValido(numeroONulo(precios[c]))) return res.status(400).json({ success: false, message: 'Los precios deben ser mayores que 0 o quedar vacíos ("Consultar").' });
    }
    for (const e of envases) {
        if (!texto(e.nombre, 100)) return res.status(400).json({ success: false, message: 'Cada envase necesita un nombre.' });
        if (!precioValido(numeroONulo(e.precio))) return res.status(400).json({ success: false, message: `El precio de ${e.nombre} debe ser mayor que 0 o quedar vacío.` });
    }
    for (const s of sets) {
        const n = parseInt(s.cantidad, 10);
        const d = parseInt(s.descuento, 10);
        if (!texto(s.nombre, 100) || !(n >= 2 && n <= 10) || !(d >= 0 && d <= 60)) {
            return res.status(400).json({ success: false, message: 'Cada set necesita nombre, entre 2 y 10 fragancias y un descuento de 0 a 60 %.' });
        }
    }
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const c of CATEGORIAS) {
            if (c in precios) await conn.query('INSERT INTO DecantPrecios (categoria, precio) VALUES (?, ?) ON DUPLICATE KEY UPDATE precio = VALUES(precio)', [c, numeroONulo(precios[c])]);
        }
        for (const [i, e] of envases.entries()) {
            const fila = [texto(e.nombre, 100), texto(e.descripcion, 300), texto(e.imagen, 500), parseInt(e.inventarioId, 10) || null,
                numeroONulo(e.precio), e.activo === false ? 0 : 1, i + 1];
            if (e.id) await conn.query('UPDATE DecantEnvases SET nombre = ?, descripcion = ?, imagen = ?, inventario_id = ?, precio = ?, activo = ?, orden = ? WHERE id = ?', [...fila, e.id]);
            else await conn.query('INSERT INTO DecantEnvases (nombre, descripcion, imagen, inventario_id, precio, activo, orden) VALUES (?, ?, ?, ?, ?, ?, ?)', fila);
        }
        for (const [i, s] of sets.entries()) {
            const fila = [texto(s.nombre, 100), parseInt(s.cantidad, 10), parseInt(s.descuento, 10), texto(s.descripcion, 300), s.activo === false ? 0 : 1, i + 1];
            if (s.id) await conn.query('UPDATE DecantSets SET nombre = ?, cantidad = ?, descuento_pct = ?, descripcion = ?, activo = ?, orden = ? WHERE id = ?', [...fila, s.id]);
            else await conn.query('INSERT INTO DecantSets (nombre, cantidad, descuento_pct, descripcion, activo, orden) VALUES (?, ?, ?, ?, ?, ?)', fila);
        }
        await conn.commit();
        res.json({ success: true, data: await decants.resumenAdmin(pool) });
    } catch (err) {
        await conn.rollback().catch(() => {});
        fallo(res, err, 'No se pudo guardar la configuración de decants');
    } finally {
        conn.release();
    }
});

// PUT /api/admin/decants/enlaces — { enlaces: [{ productoId, esenciaId | null }] }
admin.put('/enlaces', requireStaff, async (req, res) => {
    if (!esquema.decants()) return sinEsquema(res);
    const enlaces = Array.isArray(req.body?.enlaces) ? req.body.enlaces : [];
    const limpios = enlaces.map((e) => [parseInt(e.esenciaId, 10) || null, parseInt(e.productoId, 10)]).filter(([, p]) => p > 0);
    if (!limpios.length) return res.status(400).json({ success: false, message: 'No hay enlaces para guardar.' });
    try {
        const pool = await getConnection();
        for (const fila of limpios) await pool.query('UPDATE Productos SET esencia_inventario_id = ? WHERE id = ?', fila);
        res.json({ success: true, data: await decants.resumenAdmin(pool) });
    } catch (err) { fallo(res, err, 'No se pudieron guardar los enlaces'); }
});

module.exports = { publico, admin };

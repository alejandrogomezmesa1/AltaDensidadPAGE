// Catálogo unificado: configuración y precios del armador "Crea tu perfume" e insumos de DATA
const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireStaff } = require('../middleware/auth');
const esquema = require('../services/esquema');
const precios = require('../services/precios');

const sinEsquema = (res) => res.status(503).json({ success: false, message: 'El catálogo unificado aún no está listo (migración 006 pendiente).' });

// GET /api/catalogo/armador — envases con tallas y precios, tabla de esencia y parámetros
router.get('/armador', async (req, res) => {
    if (!esquema.armador()) return sinEsquema(res);
    try {
        const pool = await getConnection();
        res.json({ success: true, data: await precios.configuracionArmador(pool) });
    } catch (err) {
        console.error('Error al leer el armador:', err);
        res.status(500).json({ success: false, message: 'Error al leer la configuración del armador' });
    }
});

// PUT /api/catalogo/armador — guarda la tabla de precios (panel)
// body: { esencia: [{ categoria, ml, precio }], envases: [{ envase, ml, precio }], recargoFeromonas, presentaciones: [ml] }
router.put('/armador', requireStaff, async (req, res) => {
    if (!esquema.armador()) return sinEsquema(res);
    const { esencia = [], envases = [], recargoFeromonas, presentaciones } = req.body || {};
    const valido = (v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 10000000);
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const f of Array.isArray(esencia) ? esencia : []) {
            const precio = precios.numeroONulo(f.precio);
            const tamano = parseInt(f.ml, 10);
            if (!precios.CATEGORIAS.includes(f.categoria) || !(tamano > 0) || !valido(precio)) continue;
            await conn.query('INSERT INTO PreciosEsencia (categoria, ml, precio) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE precio = VALUES(precio)', [f.categoria, tamano, precio]);
        }
        for (const f of Array.isArray(envases) ? envases : []) {
            const precio = precios.numeroONulo(f.precio);
            const tamano = parseInt(f.ml, 10);
            const clave = precios.claveEnvase(f.envase);
            if (!clave || !(tamano > 0) || !valido(precio)) continue;
            await conn.query('INSERT INTO PreciosEnvase (envase, ml, precio) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE precio = VALUES(precio)', [clave, tamano, precio]);
        }
        if (recargoFeromonas !== undefined) {
            const recargo = precios.numeroONulo(recargoFeromonas);
            if (valido(recargo)) {
                await conn.query("INSERT INTO ParametrosTienda (clave, valor) VALUES ('recargo_feromonas', ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)", [recargo == null ? null : String(recargo)]);
            }
        }
        if (Array.isArray(presentaciones)) {
            const lista = [...new Set(presentaciones.map((x) => parseInt(x, 10)).filter((x) => x > 0 && x <= 1000))].sort((a, b) => a - b);
            if (lista.length) {
                await conn.query("INSERT INTO ParametrosTienda (clave, valor) VALUES ('presentaciones_ml', ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)", [lista.join(',')]);
            }
        }
        await conn.commit();
        res.json({ success: true, data: await precios.configuracionArmador(pool) });
    } catch (err) {
        await conn.rollback().catch(() => {});
        console.error('Error al guardar el armador:', err);
        res.status(500).json({ success: false, message: 'Error al guardar los precios del armador' });
    } finally {
        conn.release();
    }
});

// GET /api/catalogo/insumos — insumos visibles con precio y stock vivos de DATA
router.get('/insumos', async (req, res) => {
    if (!esquema.armador()) return sinEsquema(res);
    try {
        const pool = await getConnection();
        const r = await precios.listarInsumos(pool);
        res.json({ success: true, data: r.insumos, disponible: r.disponible });
    } catch (err) {
        console.error('Error al leer insumos:', err.message);
        res.status(502).json({ success: false, message: 'No se pudieron leer los insumos de DATA' });
    }
});

// GET /api/catalogo/insumos/panel — todos los insumos de DATA (visibles o no) para el panel
router.get('/insumos/panel', requireStaff, async (req, res) => {
    if (!esquema.armador()) return sinEsquema(res);
    try {
        const pool = await getConnection();
        const r = await precios.listarInsumos(pool, { todos: true });
        res.json({ success: true, data: r.insumos, disponible: r.disponible });
    } catch (err) {
        console.error('Error al leer insumos (panel):', err.message);
        res.status(502).json({ success: false, message: 'No se pudieron leer los insumos de DATA: ' + err.message });
    }
});

// PUT /api/catalogo/insumos/:id — ficha web de un insumo: { visible, imagen, descripcion, orden }
router.put('/insumos/:id', requireStaff, async (req, res) => {
    if (!esquema.armador()) return sinEsquema(res);
    const id = parseInt(req.params.id, 10);
    if (!(id > 0)) return res.status(400).json({ success: false, message: 'ID de insumo inválido' });
    const { visible, imagen, descripcion, orden } = req.body || {};
    try {
        const pool = await getConnection();
        await pool.query(
            `INSERT INTO InsumosWeb (inventario_id, visible, imagen, descripcion, orden) VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE visible = VALUES(visible), imagen = VALUES(imagen), descripcion = VALUES(descripcion), orden = VALUES(orden)`,
            [id, visible ? 1 : 0, String(imagen || '').trim().slice(0, 500) || null, String(descripcion || '').trim().slice(0, 500) || null, parseInt(orden, 10) || 0]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error al guardar insumo:', err);
        res.status(500).json({ success: false, message: 'Error al guardar el insumo' });
    }
});

module.exports = router;

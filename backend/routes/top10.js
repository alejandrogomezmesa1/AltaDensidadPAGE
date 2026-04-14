const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// GET Top 10 productos (ordenados)
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT t.posicion, t.producto_id, p.nombre, p.imagen, p.categoria, p.genero, p.descripcion, p.precio, p.rating
            FROM Top10 t
            JOIN Productos p ON t.producto_id = p.id
            ORDER BY t.posicion ASC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener Top 10', error: error.message });
    }
});

// PUT actualizar Top 10 (recibe array de producto_id en orden)
router.put('/', async (req, res) => {
    const { productos } = req.body; // productos: [id1, id2, ...]
    if (!Array.isArray(productos) || productos.length !== 10) {
        return res.status(400).json({ success: false, message: 'Debes enviar un array de 10 IDs de productos.' });
    }
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM Top10');
        for (let i = 0; i < productos.length; i++) {
            await conn.query('INSERT INTO Top10 (producto_id, posicion) VALUES (?, ?)', [productos[i], i + 1]);
        }
        await conn.commit();
        res.json({ success: true, message: 'Top 10 actualizado' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Error al actualizar Top 10', error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;

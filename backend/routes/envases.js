const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// GET todos los envases
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT e.id, e.nombre, e.imagen, e.material, e.descripcion, e.precio,
                GROUP_CONCAT(es.talla ORDER BY es.talla SEPARATOR ',') AS tallas
            FROM Envases e
            LEFT JOIN EnvaseTallas es ON es.envase_id = e.id
            GROUP BY e.id
            ORDER BY e.id
        `);
        const envases = rows.map(e => ({
            id: e.id, name: e.nombre, image: e.imagen, material: e.material,
            description: e.descripcion, price: e.precio,
            sizes: e.tallas ? e.tallas.split(',') : []
        }));
        res.json({ success: true, data: envases });
    } catch (error) {
        console.error('Error al obtener envases:', error);
        res.status(500).json({ success: false, message: 'Error al obtener envases', error: error.message });
    }
});

// GET un envase por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT e.id, e.nombre, e.imagen, e.material, e.descripcion, e.precio,
                GROUP_CONCAT(es.talla ORDER BY es.talla SEPARATOR ',') AS tallas
            FROM Envases e
            LEFT JOIN EnvaseTallas es ON es.envase_id = e.id
            WHERE e.id = ?
            GROUP BY e.id
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Envase no encontrado' });
        const e = rows[0];
        res.json({ success: true, data: { id: e.id, name: e.nombre, image: e.imagen, material: e.material, description: e.descripcion, price: e.precio, sizes: e.tallas ? e.tallas.split(',') : [] } });
    } catch (error) {
        console.error('Error al obtener envase:', error);
        res.status(500).json({ success: false, message: 'Error al obtener envase', error: error.message });
    }
});

// POST crear envase
router.post('/', async (req, res) => {
    const { name, image, material, description, price, sizes } = req.body;
    if (!name || !material) return res.status(400).json({ success: false, message: 'Nombre y material son requeridos' });
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            'INSERT INTO Envases (nombre, imagen, material, descripcion, precio) VALUES (?, ?, ?, ?, ?)',
            [name, image || '', material, description || '', price || 0]
        );
        const nuevoId = result.insertId;
        if (Array.isArray(sizes)) {
            for (const t of sizes) await conn.query('INSERT INTO EnvaseTallas (envase_id, talla) VALUES (?, ?)', [nuevoId, t]);
        }
        await conn.commit();
        res.status(201).json({ success: true, message: 'Envase creado exitosamente', data: { id: nuevoId } });
    } catch (err) {
        await conn.rollback();
        console.error('Error al crear envase:', err);
        res.status(500).json({ success: false, message: 'Error al crear envase', error: err.message });
    } finally {
        conn.release();
    }
});

// PUT actualizar envase
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, image, material, description, price, sizes } = req.body;
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [upd] = await conn.query(
            'UPDATE Envases SET nombre=?, imagen=?, material=?, descripcion=?, precio=? WHERE id=?',
            [name, image, material, description, price, id]
        );
        if (upd.affectedRows === 0) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Envase no encontrado' }); }
        await conn.query('DELETE FROM EnvaseTallas WHERE envase_id = ?', [id]);
        if (Array.isArray(sizes)) {
            for (const t of sizes) await conn.query('INSERT INTO EnvaseTallas (envase_id, talla) VALUES (?, ?)', [id, t]);
        }
        await conn.commit();
        res.json({ success: true, message: 'Envase actualizado exitosamente' });
    } catch (err) {
        await conn.rollback();
        console.error('Error al actualizar envase:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar envase', error: err.message });
    } finally {
        conn.release();
    }
});

// DELETE eliminar envase
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM EnvaseTallas WHERE envase_id = ?', [id]);
        const [result] = await conn.query('DELETE FROM Envases WHERE id = ?', [id]);
        if (result.affectedRows === 0) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Envase no encontrado' }); }
        await conn.commit();
        res.json({ success: true, message: 'Envase eliminado exitosamente' });
    } catch (err) {
        await conn.rollback();
        console.error('Error al eliminar envase:', err);
        res.status(500).json({ success: false, message: 'Error al eliminar envase', error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;

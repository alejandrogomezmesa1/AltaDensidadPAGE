const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// GET todos los kits con beneficios
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const [kits] = await pool.query('SELECT * FROM Kits ORDER BY id');
        const [beneficios] = await pool.query('SELECT * FROM KitBeneficios');
        const kitsConBeneficios = kits.map(kit => ({
            ...kit,
            beneficios: beneficios.filter(b => b.kit_id === kit.id).map(b => b.beneficio)
        }));
        res.json({ success: true, data: kitsConBeneficios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener kits', error: error.message });
    }
});

// GET un kit por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const [[kit]] = await pool.query('SELECT * FROM Kits WHERE id = ?', [id]);
        if (!kit) return res.status(404).json({ success: false, message: 'Kit no encontrado' });
        const [beneficios] = await pool.query('SELECT beneficio FROM KitBeneficios WHERE kit_id = ?', [id]);
        kit.beneficios = beneficios.map(b => b.beneficio);
        res.json({ success: true, data: kit });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener kit', error: error.message });
    }
});

// POST crear kit
router.post('/', async (req, res) => {
    const { nombre, imagen, descripcion, precio, beneficios } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            'INSERT INTO Kits (nombre, imagen, descripcion, precio) VALUES (?, ?, ?, ?)',
            [nombre, imagen || '', descripcion || '', precio || 0]
        );
        const kitId = result.insertId;
        if (Array.isArray(beneficios)) {
            for (const b of beneficios) {
                await conn.query('INSERT INTO KitBeneficios (kit_id, beneficio) VALUES (?, ?)', [kitId, b]);
            }
        }
        await conn.commit();
        res.status(201).json({ success: true, message: 'Kit creado exitosamente', data: { id: kitId } });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Error al crear kit', error: err.message });
    } finally {
        conn.release();
    }
});

// PUT actualizar kit
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, imagen, descripcion, precio, beneficios } = req.body;
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            'UPDATE Kits SET nombre=?, imagen=?, descripcion=?, precio=? WHERE id=?',
            [nombre, imagen, descripcion, precio, id]
        );
        await conn.query('DELETE FROM KitBeneficios WHERE kit_id=?', [id]);
        if (Array.isArray(beneficios)) {
            for (const b of beneficios) {
                await conn.query('INSERT INTO KitBeneficios (kit_id, beneficio) VALUES (?, ?)', [id, b]);
            }
        }
        await conn.commit();
        res.json({ success: true, message: 'Kit actualizado' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Error al actualizar kit', error: err.message });
    } finally {
        conn.release();
    }
});

// DELETE eliminar kit
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const pool = await getConnection();
    try {
        await pool.query('DELETE FROM Kits WHERE id=?', [id]);
        res.json({ success: true, message: 'Kit eliminado' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar kit', error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// GET todos los productos
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT 
                p.id, p.nombre, p.rating, p.imagen,
                p.categoria, p.genero, p.descripcion, p.precio,
                GROUP_CONCAT(DISTINCT ps.talla ORDER BY ps.talla SEPARATOR ',') AS tallas,
                GROUP_CONCAT(DISTINCT pt.tipo_envase ORDER BY pt.tipo_envase SEPARATOR ',') AS tipos_envase
            FROM Productos p
            LEFT JOIN ProductoTallas ps ON ps.producto_id = p.id
            LEFT JOIN ProductoTiposEnvase pt ON pt.producto_id = p.id
            GROUP BY p.id
            ORDER BY p.id DESC
        `);

        const productos = rows.map(p => ({
            id: p.id,
            name: p.nombre,
            rating: p.rating,
            image: p.imagen,
            category: p.categoria,
            gender: p.genero,
            description: p.descripcion,
            price: p.precio,
            sizes: p.tallas ? p.tallas.split(',') : [],
            bottleTypes: p.tipos_envase ? p.tipos_envase.split(',') : []
        }));

        res.json({ success: true, data: productos });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener productos', error: error.message });
    }
});

// GET un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT 
                p.id, p.nombre, p.rating, p.imagen,
                p.categoria, p.genero, p.descripcion, p.precio,
                GROUP_CONCAT(DISTINCT ps.talla ORDER BY ps.talla SEPARATOR ',') AS tallas,
                GROUP_CONCAT(DISTINCT pt.tipo_envase ORDER BY pt.tipo_envase SEPARATOR ',') AS tipos_envase
            FROM Productos p
            LEFT JOIN ProductoTallas ps ON ps.producto_id = p.id
            LEFT JOIN ProductoTiposEnvase pt ON pt.producto_id = p.id
            WHERE p.id = ?
            GROUP BY p.id
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const p = rows[0];
        res.json({
            success: true,
            data: {
                id: p.id, name: p.nombre, rating: p.rating, image: p.imagen,
                category: p.categoria, gender: p.genero, description: p.descripcion, price: p.precio,
                sizes: p.tallas ? p.tallas.split(',') : [],
                bottleTypes: p.tipos_envase ? p.tipos_envase.split(',') : []
            }
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ success: false, message: 'Error al obtener producto', error: error.message });
    }
});

// POST crear producto
router.post('/', async (req, res) => {
    const { name, rating, image, category, gender, description, price, sizes, bottleTypes } = req.body;
    if (!name || !category || !gender) {
        return res.status(400).json({ success: false, message: 'Nombre, categoria y genero son requeridos' });
    }
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            'INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, rating || 4, image || '', category, gender, description || '', price || 0]
        );
        const nuevoId = result.insertId;
        if (Array.isArray(sizes)) {
            for (const t of sizes) await conn.query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (?, ?)', [nuevoId, t]);
        }
        if (Array.isArray(bottleTypes)) {
            for (const t of bottleTypes) await conn.query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (?, ?)', [nuevoId, t]);
        }
        await conn.commit();
        res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: { id: nuevoId } });
    } catch (err) {
        await conn.rollback();
        console.error('Error al crear producto:', err);
        res.status(500).json({ success: false, message: 'Error al crear producto', error: err.message });
    } finally {
        conn.release();
    }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, rating, image, category, gender, description, price, sizes, bottleTypes } = req.body;
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [upd] = await conn.query(
            'UPDATE Productos SET nombre=?, rating=?, imagen=?, categoria=?, genero=?, descripcion=?, precio=? WHERE id=?',
            [name, rating, image, category, gender, description, price, id]
        );
        if (upd.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        await conn.query('DELETE FROM ProductoTallas WHERE producto_id = ?', [id]);
        await conn.query('DELETE FROM ProductoTiposEnvase WHERE producto_id = ?', [id]);
        if (Array.isArray(sizes)) {
            for (const t of sizes) await conn.query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (?, ?)', [id, t]);
        }
        if (Array.isArray(bottleTypes)) {
            for (const t of bottleTypes) await conn.query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (?, ?)', [id, t]);
        }
        await conn.commit();
        res.json({ success: true, message: 'Producto actualizado exitosamente' });
    } catch (err) {
        await conn.rollback();
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar producto', error: err.message });
    } finally {
        conn.release();
    }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM ProductoTallas WHERE producto_id = ?', [id]);
        await conn.query('DELETE FROM ProductoTiposEnvase WHERE producto_id = ?', [id]);
        const [result] = await conn.query('DELETE FROM Productos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        await conn.commit();
        res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (err) {
        await conn.rollback();
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ success: false, message: 'Error al eliminar producto', error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;

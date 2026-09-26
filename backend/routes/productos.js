const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireStaff, requireAdmin, esPeticionStaff } = require('../middleware/auth');
const dataSync = require('../services/dataSync');

// Columnas de la integración con DATA (existen tras la migración de arranque)
const columnasData = () => (dataSync.columnasListas() ? ', p.agotado, p.inventario_id' : '');

// inventario_id solo se entrega al panel; el público solo ve si está agotado
function camposData(p, staff) {
    const extra = { agotado: p.agotado ? 1 : 0 };
    if (staff) extra.inventario_id = p.inventario_id || null;
    return extra;
}

function parseInventarioId(valor) {
    const n = parseInt(valor, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
}

// Enlaza (o desenlaza con null) un producto con un ítem del inventario de DATA
async function guardarEnlaceData(conn, id, body) {
    if (!dataSync.columnasListas() || !Object.prototype.hasOwnProperty.call(body, 'inventario_id')) return false;
    const invId = parseInventarioId(body.inventario_id);
    await conn.query('UPDATE Productos SET inventario_id = ?, agotado = IF(? IS NULL, 0, agotado) WHERE id = ?', [invId, invId, id]);
    return true;
}

// GET todos los productos
router.get('/', async (req, res) => {
    try {
        const staff = esPeticionStaff(req);
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT 
                p.id, p.nombre, p.rating, p.imagen,
                p.categoria, p.genero, p.descripcion, p.precio, p.activo${columnasData()},
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
            activo: p.activo,
            sizes: p.tallas ? p.tallas.split(',') : [],
            bottleTypes: p.tipos_envase ? p.tipos_envase.split(',') : [],
            ...camposData(p, staff)
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
                p.categoria, p.genero, p.descripcion, p.precio, p.activo${columnasData()},
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
                activo: p.activo,
                sizes: p.tallas ? p.tallas.split(',') : [],
                bottleTypes: p.tipos_envase ? p.tipos_envase.split(',') : [],
                ...camposData(p, esPeticionStaff(req))
            }
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ success: false, message: 'Error al obtener producto', error: error.message });
    }
});

// POST crear producto
router.post('/', requireStaff, async (req, res) => {
    const { name, rating, image, category, gender, description, price, sizes, bottleTypes, activo } = req.body;
    if (!name || !category || !gender) {
        return res.status(400).json({ success: false, message: 'Nombre, categoria y genero son requeridos' });
    }
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            'INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, rating || 4, image || '', category, gender, description || '', price || 0, activo !== undefined ? activo : 1]
        );
        const nuevoId = result.insertId;
        const enlazado = await guardarEnlaceData(conn, nuevoId, req.body);
        if (Array.isArray(sizes)) {
            for (const t of sizes) await conn.query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (?, ?)', [nuevoId, t]);
        }
        if (Array.isArray(bottleTypes)) {
            for (const t of bottleTypes) await conn.query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (?, ?)', [nuevoId, t]);
        }
        await conn.commit();
        if (enlazado) dataSync.sincronizarCatalogo().catch(() => {});
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
router.put('/:id', requireStaff, async (req, res) => {
    const { id } = req.params;
    const { name, rating, image, category, gender, description, price, sizes, bottleTypes, activo } = req.body;
    const pool = await getConnection();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [upd] = await conn.query(
            'UPDATE Productos SET nombre=?, rating=?, imagen=?, categoria=?, genero=?, descripcion=?, precio=?, activo=? WHERE id=?',
            [name, rating, image, category, gender, description, price, activo !== undefined ? activo : 1, id]
        );
        if (upd.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        const enlazado = await guardarEnlaceData(conn, id, req.body);
        await conn.query('DELETE FROM ProductoTallas WHERE producto_id = ?', [id]);
        await conn.query('DELETE FROM ProductoTiposEnvase WHERE producto_id = ?', [id]);
        if (Array.isArray(sizes)) {
            for (const t of sizes) await conn.query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (?, ?)', [id, t]);
        }
        if (Array.isArray(bottleTypes)) {
            for (const t of bottleTypes) await conn.query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (?, ?)', [id, t]);
        }
        await conn.commit();
        if (enlazado) dataSync.sincronizarCatalogo().catch(() => {});
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
router.delete('/:id', requireAdmin, async (req, res) => {
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

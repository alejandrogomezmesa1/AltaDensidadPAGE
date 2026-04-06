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
            ORDER BY p.id
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

// GET todos los productos (fragancias)
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    p.id, p.nombre, p.rating, p.imagen, 
                    p.categoria, p.genero, p.descripcion, p.precio,
                    STUFF((SELECT DISTINCT ',' + ps2.talla FROM ProductoTallas ps2 WHERE ps2.producto_id = p.id FOR XML PATH('')), 1, 1, '') AS tallas,
                    STUFF((SELECT DISTINCT ',' + pt2.tipo_envase FROM ProductoTiposEnvase pt2 WHERE pt2.producto_id = p.id FOR XML PATH('')), 1, 1, '') AS tipos_envase
                FROM Productos p
                ORDER BY p.id
            `);

        const productos = result.recordset.map(p => ({
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
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    p.id, p.nombre, p.rating, p.imagen, 
                    p.categoria, p.genero, p.descripcion, p.precio,
                    STUFF((SELECT DISTINCT ',' + ps2.talla FROM ProductoTallas ps2 WHERE ps2.producto_id = p.id FOR XML PATH('')), 1, 1, '') AS tallas,
                    STUFF((SELECT DISTINCT ',' + pt2.tipo_envase FROM ProductoTiposEnvase pt2 WHERE pt2.producto_id = p.id FOR XML PATH('')), 1, 1, '') AS tipos_envase
                FROM Productos p
                WHERE p.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const p = result.recordset[0];
        const producto = {
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
        };

        res.json({ success: true, data: producto });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ success: false, message: 'Error al obtener producto', error: error.message });
    }
});

// POST crear producto
router.post('/', async (req, res) => {
    try {
        const { name, rating, image, category, gender, description, price, sizes, bottleTypes } = req.body;

        if (!name || !category || !gender) {
            return res.status(400).json({ success: false, message: 'Nombre, categoria y genero son requeridos' });
        }

        const pool = await getConnection();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            const result = await transaction.request()
                .input('nombre', sql.NVarChar(200), name)
                .input('rating', sql.Int, rating || 4)
                .input('imagen', sql.NVarChar(300), image || '')
                .input('categoria', sql.NVarChar(100), category)
                .input('genero', sql.NVarChar(50), gender)
                .input('descripcion', sql.NVarChar(sql.MAX), description || '')
                .input('precio', sql.Decimal(10, 2), price || 0)
                .query(`
                    INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio)
                    OUTPUT INSERTED.id
                    VALUES (@nombre, @rating, @imagen, @categoria, @genero, @descripcion, @precio)
                `);

            const nuevoId = result.recordset[0].id;

            if (sizes && Array.isArray(sizes)) {
                for (const talla of sizes) {
                    await transaction.request()
                        .input('producto_id', sql.Int, nuevoId)
                        .input('talla', sql.NVarChar(20), talla)
                        .query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (@producto_id, @talla)');
                }
            }

            if (bottleTypes && Array.isArray(bottleTypes)) {
                for (const tipo of bottleTypes) {
                    await transaction.request()
                        .input('producto_id', sql.Int, nuevoId)
                        .input('tipo_envase', sql.NVarChar(100), tipo)
                        .query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (@producto_id, @tipo_envase)');
                }
            }

            await transaction.commit();
            res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: { id: nuevoId } });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ success: false, message: 'Error al crear producto', error: error.message });
    }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rating, image, category, gender, description, price, sizes, bottleTypes } = req.body;

        const pool = await getConnection();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            const updateResult = await transaction.request()
                .input('id', sql.Int, id)
                .input('nombre', sql.NVarChar(200), name)
                .input('rating', sql.Int, rating)
                .input('imagen', sql.NVarChar(300), image)
                .input('categoria', sql.NVarChar(100), category)
                .input('genero', sql.NVarChar(50), gender)
                .input('descripcion', sql.NVarChar(sql.MAX), description)
                .input('precio', sql.Decimal(10, 2), price)
                .query(`
                    UPDATE Productos 
                    SET nombre=@nombre, rating=@rating, imagen=@imagen, 
                        categoria=@categoria, genero=@genero, descripcion=@descripcion, precio=@precio
                    WHERE id = @id
                `);

            if (updateResult.rowsAffected[0] === 0) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }

            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ProductoTallas WHERE producto_id = @id');

            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ProductoTiposEnvase WHERE producto_id = @id');

            if (sizes && Array.isArray(sizes)) {
                for (const talla of sizes) {
                    await transaction.request()
                        .input('producto_id', sql.Int, id)
                        .input('talla', sql.NVarChar(20), talla)
                        .query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (@producto_id, @talla)');
                }
            }

            if (bottleTypes && Array.isArray(bottleTypes)) {
                for (const tipo of bottleTypes) {
                    await transaction.request()
                        .input('producto_id', sql.Int, id)
                        .input('tipo_envase', sql.NVarChar(100), tipo)
                        .query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (@producto_id, @tipo_envase)');
                }
            }

            await transaction.commit();
            res.json({ success: true, message: 'Producto actualizado exitosamente' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar producto', error: error.message });
    }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ProductoTallas WHERE producto_id = @id');

            await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ProductoTiposEnvase WHERE producto_id = @id');

            const result = await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Productos WHERE id = @id');

            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }

            await transaction.commit();
            res.json({ success: true, message: 'Producto eliminado exitosamente' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar producto', error: error.message });
    }
});

module.exports = router;

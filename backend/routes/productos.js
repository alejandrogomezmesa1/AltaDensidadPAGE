const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireStaff, requireAdmin, esPeticionStaff } = require('../middleware/auth');
const dataSync = require('../services/dataSync');
const esquema = require('../services/esquema');

// Columnas de la integración con DATA (existen tras la migración de arranque)
const columnasData = () => (dataSync.columnasListas() ? `, p.agotado, p.inventario_id${esquema.sinStock() ? ', p.vender_sin_stock' : ''}` : '');

// inventario_id solo se entrega al panel; el público solo ve si está agotado.
// Con "vender sin existencias" la tienda no lo muestra agotado aunque DATA no tenga stock.
function camposData(p, staff) {
    const sinStock = Boolean(p.vender_sin_stock);
    const extra = { agotado: p.agotado && !sinStock ? 1 : 0 };
    if (staff) Object.assign(extra, { inventario_id: p.inventario_id || null, agotado_data: p.agotado ? 1 : 0, vender_sin_stock: sinStock ? 1 : 0 });
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

// ------------------------------------------------------------
// Ficha de clasificación (migración 005): marca, original, familia, acordes y notas
// ------------------------------------------------------------
const NIVELES = { salida: 'top', corazon: 'heart', fondo: 'base' };
const columnasFicha = () => (esquema.clasificacion()
    ? ', p.nombre_original, p.precio_revision, m.id AS marca_id, m.nombre AS marca, f.id AS familia_id, f.nombre AS familia'
    : '');
const joinsFicha = () => (esquema.clasificacion()
    ? ' LEFT JOIN marcas m ON m.id = p.marca_id LEFT JOIN familias_olfativas f ON f.id = p.familia_id'
    : '');
const agrupar = () => (esquema.clasificacion() ? ', m.id, f.id' : '');

// Acordes y notas de varios productos en dos consultas
async function cargarListas(pool, ids) {
    const acordes = new Map();
    const notas = new Map();
    if (!esquema.clasificacion() || !ids.length) return { acordes, notas };
    const [ac] = await pool.query(
        'SELECT pa.producto_id, a.nombre FROM producto_acordes pa JOIN acordes a ON a.id = pa.acorde_id WHERE pa.producto_id IN (?) ORDER BY pa.orden, a.nombre', [ids]);
    ac.forEach(r => { if (!acordes.has(r.producto_id)) acordes.set(r.producto_id, []); acordes.get(r.producto_id).push(r.nombre); });
    const [nt] = await pool.query(
        'SELECT pn.producto_id, pn.nivel, n.nombre FROM producto_notas pn JOIN notas n ON n.id = pn.nota_id WHERE pn.producto_id IN (?) ORDER BY pn.orden, n.nombre', [ids]);
    nt.forEach(r => {
        if (!notas.has(r.producto_id)) notas.set(r.producto_id, { top: [], heart: [], base: [] });
        notas.get(r.producto_id)[NIVELES[r.nivel]].push(r.nombre);
    });
    return { acordes, notas };
}

function camposFicha(p, listas) {
    if (!esquema.clasificacion()) return {};
    return {
        brand: p.marca_id ? { id: p.marca_id, name: p.marca } : null,
        originalName: p.nombre_original || null,
        family: p.familia_id ? { id: p.familia_id, name: p.familia } : null,
        accords: listas.acordes.get(p.id) || [],
        notes: listas.notas.get(p.id) || { top: [], heart: [], base: [] },
        priceReview: p.precio_revision ? 1 : 0
    };
}

const limpiarNombre = (v, max) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);

// Devuelve los IDs de los nombres dados en un catálogo, creando los que falten (sin duplicar)
async function idsDeNombres(conn, tabla, nombres, max) {
    const ids = [];
    const vistos = new Set();
    for (const bruto of Array.isArray(nombres) ? nombres : []) {
        const nombre = limpiarNombre(bruto, max);
        if (!nombre || vistos.has(nombre.toLowerCase())) continue;
        vistos.add(nombre.toLowerCase());
        await conn.query(`INSERT IGNORE INTO ${tabla} (nombre) VALUES (?)`, [nombre]);
        const [[fila]] = await conn.query(`SELECT id FROM ${tabla} WHERE nombre = ?`, [nombre]);
        ids.push(fila.id);
    }
    return ids;
}

const tiene = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);

// Guarda solo las partes de la ficha que vienen en el cuerpo de la petición
async function guardarFicha(conn, id, body) {
    if (!esquema.clasificacion()) return;
    if (tiene(body, 'brand')) {
        const [marcaId] = await idsDeNombres(conn, 'marcas', body.brand ? [body.brand] : [], 80);
        await conn.query('UPDATE Productos SET marca_id = ? WHERE id = ?', [marcaId || null, id]);
    }
    if (tiene(body, 'originalName')) {
        await conn.query('UPDATE Productos SET nombre_original = ? WHERE id = ?', [limpiarNombre(body.originalName, 160) || null, id]);
    }
    if (tiene(body, 'familyId')) {
        const familia = parseInt(body.familyId, 10);
        await conn.query('UPDATE Productos SET familia_id = ? WHERE id = ?', [Number.isInteger(familia) && familia > 0 ? familia : null, id]);
    }
    if (tiene(body, 'accords')) {
        const ids = await idsDeNombres(conn, 'acordes', body.accords, 60);
        await conn.query('DELETE FROM producto_acordes WHERE producto_id = ?', [id]);
        for (const [i, acordeId] of ids.entries()) {
            await conn.query('INSERT INTO producto_acordes (producto_id, acorde_id, orden) VALUES (?, ?, ?)', [id, acordeId, i]);
        }
    }
    if (tiene(body, 'notes') && body.notes && typeof body.notes === 'object') {
        await conn.query('DELETE FROM producto_notas WHERE producto_id = ?', [id]);
        for (const [nivel, clave] of Object.entries(NIVELES)) {
            const ids = await idsDeNombres(conn, 'notas', body.notes[clave], 80);
            for (const [i, notaId] of ids.entries()) {
                await conn.query('INSERT INTO producto_notas (producto_id, nota_id, nivel, orden) VALUES (?, ?, ?, ?)', [id, notaId, nivel, i]);
            }
        }
    }
}

// GET catálogos de clasificación (filtros de la tienda y sugerencias del panel)
router.get('/clasificacion', async (req, res) => {
    if (!esquema.clasificacion()) return res.json({ success: true, data: { brands: [], families: [], accords: [], notes: [] } });
    try {
        const pool = await getConnection();
        const consulta = (sql) => pool.query(sql).then(([r]) => r.map(x => ({ id: x.id, name: x.nombre, count: Number(x.n) })));
        const [brands, families, accords, notes] = await Promise.all([
            consulta('SELECT m.id, m.nombre, COUNT(p.id) n FROM marcas m LEFT JOIN Productos p ON p.marca_id = m.id GROUP BY m.id ORDER BY m.nombre'),
            consulta('SELECT f.id, f.nombre, COUNT(p.id) n FROM familias_olfativas f LEFT JOIN Productos p ON p.familia_id = f.id GROUP BY f.id ORDER BY f.nombre'),
            consulta('SELECT a.id, a.nombre, COUNT(pa.producto_id) n FROM acordes a LEFT JOIN producto_acordes pa ON pa.acorde_id = a.id GROUP BY a.id ORDER BY a.nombre'),
            consulta('SELECT n.id, n.nombre, COUNT(DISTINCT pn.producto_id) n FROM notas n LEFT JOIN producto_notas pn ON pn.nota_id = n.id GROUP BY n.id ORDER BY n.nombre')
        ]);
        res.json({ success: true, data: { brands, families, accords, notes } });
    } catch (error) {
        console.error('Error al obtener clasificación:', error);
        res.status(500).json({ success: false, message: 'Error al obtener la clasificación' });
    }
});

// GET todos los productos
router.get('/', async (req, res) => {
    try {
        const staff = esPeticionStaff(req);
        const pool = await getConnection();
        const [rows] = await pool.query(`
            SELECT 
                p.id, p.nombre, p.rating, p.imagen,
                p.categoria, p.genero, p.descripcion, p.precio, p.activo${columnasData()}${columnasFicha()},
                GROUP_CONCAT(DISTINCT ps.talla ORDER BY ps.talla SEPARATOR ',') AS tallas,
                GROUP_CONCAT(DISTINCT pt.tipo_envase ORDER BY pt.tipo_envase SEPARATOR ',') AS tipos_envase
            FROM Productos p
            LEFT JOIN ProductoTallas ps ON ps.producto_id = p.id
            LEFT JOIN ProductoTiposEnvase pt ON pt.producto_id = p.id${joinsFicha()}
            ${staff ? '' : 'WHERE p.activo = 1'}
            GROUP BY p.id${agrupar()}
            ORDER BY p.id DESC
        `);

        const listas = await cargarListas(pool, rows.map(p => p.id));
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
            ...camposData(p, staff),
            ...camposFicha(p, listas)
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
                p.categoria, p.genero, p.descripcion, p.precio, p.activo${columnasData()}${columnasFicha()},
                GROUP_CONCAT(DISTINCT ps.talla ORDER BY ps.talla SEPARATOR ',') AS tallas,
                GROUP_CONCAT(DISTINCT pt.tipo_envase ORDER BY pt.tipo_envase SEPARATOR ',') AS tipos_envase
            FROM Productos p
            LEFT JOIN ProductoTallas ps ON ps.producto_id = p.id
            LEFT JOIN ProductoTiposEnvase pt ON pt.producto_id = p.id${joinsFicha()}
            WHERE p.id = ?
            GROUP BY p.id${agrupar()}
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const p = rows[0];
        const listas = await cargarListas(pool, [p.id]);
        res.json({
            success: true,
            data: {
                id: p.id, name: p.nombre, rating: p.rating, image: p.imagen,
                category: p.categoria, gender: p.genero, description: p.descripcion, price: p.precio,
                activo: p.activo,
                sizes: p.tallas ? p.tallas.split(',') : [],
                bottleTypes: p.tipos_envase ? p.tipos_envase.split(',') : [],
                ...camposData(p, esPeticionStaff(req)),
                ...camposFicha(p, listas)
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
        await guardarFicha(conn, nuevoId, req.body);
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
        await guardarFicha(conn, id, req.body);
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

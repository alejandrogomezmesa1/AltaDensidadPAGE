const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireStaff, requireAdmin, esPeticionStaff } = require('../middleware/auth');
const dataSync = require('../services/dataSync');
const esquema = require('../services/esquema');
const enlaces = require('../services/enlaces');

// Columnas de la integración con DATA (existen tras la migración de arranque)
const columnasData = () => (dataSync.columnasListas() ? `, p.agotado, p.inventario_id${esquema.sinStock() ? ', p.vender_sin_stock' : ''}` : '');

// Solo preparado (migración 008): no se vende como 1.1, sí en "Crea tu perfume"
const columnasPreparado = () => (esquema.soloPreparado() ? ', p.solo_preparado' : '')
    + (esquema.enlaces() ? ', p.ruta, p.fragrantica_url' : '');

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
// Listados por marca (sin marca al final) y, dentro de cada marca, por nombre
const ordenMarca = () => (esquema.clasificacion() ? 'ORDER BY m.nombre IS NULL, m.nombre, p.nombre' : 'ORDER BY p.nombre');
const agrupar = () => (esquema.clasificacion() ? ', m.id, f.id' : '');

// Acordes, notas y familias de varios productos en pocas consultas
async function cargarListas(pool, ids) {
    const acordes = new Map();
    const notas = new Map();
    const familias = new Map();
    if (!esquema.clasificacion() || !ids.length) return { acordes, notas, familias };
    if (esquema.familias()) {
        const [fm] = await pool.query(
            'SELECT pf.producto_id, f.id, f.nombre FROM producto_familias pf JOIN familias_olfativas f ON f.id = pf.familia_id WHERE pf.producto_id IN (?) ORDER BY pf.orden, f.nombre', [ids]);
        fm.forEach(r => { if (!familias.has(r.producto_id)) familias.set(r.producto_id, []); familias.get(r.producto_id).push({ id: r.id, name: r.nombre }); });
    }
    const [ac] = await pool.query(
        'SELECT pa.producto_id, a.nombre FROM producto_acordes pa JOIN acordes a ON a.id = pa.acorde_id WHERE pa.producto_id IN (?) ORDER BY pa.orden, a.nombre', [ids]);
    ac.forEach(r => { if (!acordes.has(r.producto_id)) acordes.set(r.producto_id, []); acordes.get(r.producto_id).push(r.nombre); });
    const [nt] = await pool.query(
        'SELECT pn.producto_id, pn.nivel, n.nombre FROM producto_notas pn JOIN notas n ON n.id = pn.nota_id WHERE pn.producto_id IN (?) ORDER BY pn.orden, n.nombre', [ids]);
    nt.forEach(r => {
        if (!notas.has(r.producto_id)) notas.set(r.producto_id, { top: [], heart: [], base: [] });
        notas.get(r.producto_id)[NIVELES[r.nivel]].push(r.nombre);
    });
    return { acordes, notas, familias };
}

function camposFicha(p, listas) {
    if (!esquema.clasificacion()) return {};
    return {
        brand: p.marca_id ? { id: p.marca_id, name: p.marca } : null,
        originalName: p.nombre_original || null,
        family: p.familia_id ? { id: p.familia_id, name: p.familia } : null,
        // Todas las familias en orden (la primera es la principal)
        families: listas.familias && listas.familias.get(p.id) ? listas.familias.get(p.id) : (p.familia_id ? [{ id: p.familia_id, name: p.familia }] : []),
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
    // familyIds: varias familias en orden (la primera es la principal); familyId: una sola (anterior)
    if (tiene(body, 'familyIds') || tiene(body, 'familyId')) {
        const lista = tiene(body, 'familyIds') ? (Array.isArray(body.familyIds) ? body.familyIds : []) : [body.familyId];
        const ids = [...new Set(lista.map((x) => parseInt(x, 10)).filter((x) => Number.isInteger(x) && x > 0))];
        await conn.query('UPDATE Productos SET familia_id = ? WHERE id = ?', [ids[0] || null, id]);
        if (esquema.familias()) {
            await conn.query('DELETE FROM producto_familias WHERE producto_id = ?', [id]);
            for (const [i, familiaId] of ids.entries()) {
                await conn.query('INSERT INTO producto_familias (producto_id, familia_id, orden) VALUES (?, ?, ?)', [id, familiaId, i]);
            }
        }
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

// Dirección en la tienda y referencia en Fragrantica (migración 009). Sin ruta escrita, se
// propone desde la marca y el nombre; una vez guardada no cambia aunque se edite el nombre.
async function guardarEnlaces(conn, id, body, { nuevo = false } = {}) {
    if (!esquema.enlaces()) return;
    if (tiene(body, 'fragranticaUrl')) {
        const texto = String(body.fragranticaUrl || '').trim();
        const ref = texto ? enlaces.desdeFragrantica(texto) : null;
        if (texto && !ref) {
            const err = new Error('El enlace de Fragrantica no es válido: debe ser como https://www.fragrantica.es/perfume/Marca/Nombre-1234.html');
            err.status = 400;
            throw err;
        }
        await conn.query('UPDATE Productos SET fragrantica_url = ? WHERE id = ?', [ref ? ref.url : null, id]);
    }
    if (tiene(body, 'ruta') || nuevo) {
        let ruta = enlaces.normalizarRuta(body.ruta);
        if (!ruta) {
            const [[f]] = await conn.query(esquema.clasificacion()
                ? 'SELECT p.nombre, m.nombre AS marca FROM Productos p LEFT JOIN marcas m ON m.id = p.marca_id WHERE p.id = ?'
                : 'SELECT nombre, NULL AS marca FROM Productos WHERE id = ?', [id]);
            ruta = enlaces.rutaPorDefecto(f.nombre, f.marca);
        }
        await conn.query('UPDATE Productos SET ruta = ? WHERE id = ?', [ruta, id]);
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
            consulta(esquema.familias()
                ? 'SELECT f.id, f.nombre, COUNT(pf.producto_id) n FROM familias_olfativas f LEFT JOIN producto_familias pf ON pf.familia_id = f.id GROUP BY f.id ORDER BY f.nombre'
                : 'SELECT f.id, f.nombre, COUNT(p.id) n FROM familias_olfativas f LEFT JOIN Productos p ON p.familia_id = f.id GROUP BY f.id ORDER BY f.nombre'),
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
                p.categoria, p.genero, p.descripcion, p.precio, p.activo${columnasData()}${columnasPreparado()}${columnasFicha()},
                GROUP_CONCAT(DISTINCT ps.talla ORDER BY ps.talla SEPARATOR ',') AS tallas,
                GROUP_CONCAT(DISTINCT pt.tipo_envase ORDER BY pt.tipo_envase SEPARATOR ',') AS tipos_envase
            FROM Productos p
            LEFT JOIN ProductoTallas ps ON ps.producto_id = p.id
            LEFT JOIN ProductoTiposEnvase pt ON pt.producto_id = p.id${joinsFicha()}
            ${staff ? '' : 'WHERE p.activo = 1'}
            GROUP BY p.id${agrupar()}
            ${ordenMarca()}
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
            ...(esquema.soloPreparado() ? { soloPreparado: p.solo_preparado ? 1 : 0 } : {}),
            ...(esquema.enlaces() ? { ruta: p.ruta || null, fragranticaUrl: p.fragrantica_url || null } : {}),
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
                p.categoria, p.genero, p.descripcion, p.precio, p.activo${columnasData()}${columnasPreparado()}${columnasFicha()},
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
                ...(esquema.soloPreparado() ? { soloPreparado: p.solo_preparado ? 1 : 0 } : {}),
            ...(esquema.enlaces() ? { ruta: p.ruta || null, fragranticaUrl: p.fragrantica_url || null } : {}),
                ...camposFicha(p, listas)
            }
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ success: false, message: 'Error al obtener producto', error: error.message });
    }
});

// Datos mínimos de un producto: sin precio se vendería en $0 y sin talla el pedido no dice qué entregar
function errorProducto(b) {
    if (!b.name || !String(b.name).trim() || !b.category || !b.gender) return 'Nombre, categoria y genero son requeridos';
    if (!(Number(b.price) > 0)) return 'El precio debe ser mayor que 0';
    if (!Array.isArray(b.sizes) || !b.sizes.length) return 'Elige al menos una talla';
    return null;
}

// POST crear producto
router.post('/', requireStaff, async (req, res) => {
    const { name, rating, image, category, gender, description, price, sizes, bottleTypes, activo } = req.body;
    if (errorProducto(req.body)) return res.status(400).json({ success: false, message: errorProducto(req.body) });
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
        await guardarEnlaces(conn, nuevoId, req.body, { nuevo: true });
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
        if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
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
    if (errorProducto(req.body)) return res.status(400).json({ success: false, message: errorProducto(req.body) });
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
        await guardarEnlaces(conn, id, req.body);
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
        if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
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

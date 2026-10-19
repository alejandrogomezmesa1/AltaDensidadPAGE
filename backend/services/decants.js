// ============================================================
// Decants de 10 ml (migración 013)
// ------------------------------------------------------------
// · Una fragancia se ofrece en decant si está enlazada a su esencia de DATA
//   (Productos.esencia_inventario_id) y a esa esencia le alcanza para al menos un decant.
// · Precio de un decant = DecantPrecios[categoría] + precio del envase elegido. Sin feromonas.
// · Set = N decants que elige el cliente, con el descuento del set sobre la suma (redondeado a $100).
// · Vigilante: DATA da el costo (receta de decant + esencia + envase); si el precio no lo
//   cubre, esa combinación no se vende.
// · Al cobrar, cada decant viaja a DATA como receta { scope: 'decant', essenceId, containerId }
//   y DATA descuenta esencia, envase e insumos.
// ============================================================
const bridge = require('./dataBridge');
const { ErrorPrecio, categoriaPrecio, numeroONulo, CATEGORIAS } = require('./precios');

const ML = 10;
const POCOS = 3; // con 3 decants o menos la tienda avisa "últimas unidades"

async function leerConfig(pool, { todos = false } = {}) {
    const [precios] = await pool.query('SELECT categoria, precio FROM DecantPrecios');
    const [envases] = await pool.query(`SELECT id, nombre, descripcion, imagen, inventario_id, precio, activo, orden FROM DecantEnvases
        ${todos ? '' : 'WHERE activo = 1'} ORDER BY orden, id`);
    const [sets] = await pool.query(`SELECT id, nombre, cantidad, descuento_pct, descripcion, activo, orden FROM DecantSets
        ${todos ? '' : 'WHERE activo = 1'} ORDER BY orden, cantidad, id`);
    return {
        precios: Object.fromEntries(CATEGORIAS.map((c) => [c, numeroONulo((precios.find((p) => p.categoria === c) || {}).precio)])),
        envases: envases.map((e) => ({ id: e.id, nombre: e.nombre, descripcion: e.descripcion, imagen: e.imagen, inventarioId: e.inventario_id,
            precio: numeroONulo(e.precio), activo: Boolean(e.activo), orden: e.orden })),
        sets: sets.map((s) => ({ id: s.id, nombre: s.nombre, cantidad: s.cantidad, descuento: s.descuento_pct, descripcion: s.descripcion,
            activo: Boolean(s.activo), orden: s.orden }))
    };
}

// Datos vivos de DATA; null si la integración no está o no responde (entonces no se vende en línea)
async function datosData() {
    if (!bridge.habilitado()) return null;
    try {
        const d = await bridge.obtenerDecants();
        return d && d.disponible ? d : null;
    } catch (err) {
        console.warn('[DECANTS] DATA no respondió:', err.message);
        return null;
    }
}

const costoDecant = (data, esencia, envaseInv) => data.costoInsumos + data.esenciaMl * (esencia ? esencia.costPerMl : 0) + (envaseInv ? envaseInv.cost : 0);

// Catálogo público: envases, sets y qué fragancias se pueden pedir en decant (sin costos)
async function catalogo(pool) {
    const cfg = await leerConfig(pool);
    const data = await datosData();
    const esencias = new Map((data ? data.esencias : []).map((e) => [e.id, e]));
    const envInv = new Map((data ? data.envases : []).map((e) => [e.id, e]));
    const envases = cfg.envases.map((e) => {
        const inv = envInv.get(e.inventarioId);
        return {
            id: e.id, nombre: e.nombre, descripcion: e.descripcion, imagen: e.imagen, precio: e.precio,
            disponible: Boolean(data && inv && inv.decants > 0 && e.precio != null)
        };
    });
    const [productos] = await pool.query('SELECT id, categoria, esencia_inventario_id AS esencia FROM Productos WHERE activo = 1 AND esencia_inventario_id IS NOT NULL');
    const fragancias = productos.map((p) => {
        const es = esencias.get(Number(p.esencia));
        const categoria = categoriaPrecio(p.categoria);
        const precio = cfg.precios[categoria];
        // Envases con los que esta fragancia no cubre su costo (no se venden en esa combinación)
        const bloqueados = data && es ? cfg.envases.filter((e) => e.precio != null && precio != null
            && precio + e.precio <= costoDecant(data, es, envInv.get(e.inventarioId))).map((e) => e.id) : [];
        const restantes = es ? es.decants : 0;
        return {
            productoId: p.id, categoria, precio,
            disponible: Boolean(data && data.recetaLista && es && restantes > 0 && precio != null),
            pocos: restantes > 0 && restantes <= POCOS,
            bloqueados
        };
    });
    return { disponible: Boolean(data), recetaLista: Boolean(data && data.recetaLista), ml: ML, envases, sets: cfg.sets, fragancias };
}

// Un decant: valida fragancia y envase y devuelve la línea de cobro con su receta para DATA
function lineaDecant(cat, productos, productoId, envaseId) {
    const f = cat.fragancias.find((x) => x.productoId === productoId);
    const p = productos.get(productoId);
    if (!p || !f) throw new ErrorPrecio(`La fragancia elegida no está disponible en decant (ID: ${productoId}).`);
    const envase = cat.envases.find((e) => e.id === envaseId);
    if (!envase) throw new ErrorPrecio('El envase de decant elegido ya no está disponible.');
    if (!cat.disponible) throw new ErrorPrecio('Los decants no se pueden comprar en línea en este momento. Escríbenos por WhatsApp.', 503);
    if (f.precio == null || envase.precio == null) {
        throw new ErrorPrecio(`El decant de ${p.nombre} aún no tiene precio en línea. Escríbenos por WhatsApp para cotizarlo.`, 409);
    }
    if (!f.disponible) throw new ErrorPrecio(`${p.nombre} no tiene esencia suficiente para un decant en este momento.`, 409);
    if (!envase.disponible) throw new ErrorPrecio(`El ${envase.nombre.toLowerCase()} está agotado en este momento.`, 409);
    if (f.bloqueados.includes(envase.id)) throw new ErrorPrecio(`El decant de ${p.nombre} está en revisión de precio.`, 409);
    return {
        nombre: p.nombre,
        precio: f.precio + envase.precio,
        envase,
        recipe: { scope: 'decant', ml: ML, essenceId: Number(p.esencia), containerId: Number(envase.inventarioId) }
    };
}

async function fichas(pool, ids) {
    const [rows] = await pool.query('SELECT id, nombre, imagen, esencia_inventario_id AS esencia FROM Productos WHERE id IN (?)', [ids.length ? ids : [0]]);
    return new Map(rows.map((r) => [r.id, r]));
}

async function catalogoParaCobrar(pool) {
    const cat = await catalogo(pool);
    // El id del envase del catálogo público no trae el ítem de DATA: se añade aquí (solo backend)
    const cfg = await leerConfig(pool);
    const inv = new Map(cfg.envases.map((e) => [e.id, e.inventarioId]));
    cat.envases = cat.envases.map((e) => ({ ...e, inventarioId: inv.get(e.id) }));
    return cat;
}

// dec_<productoId>_<envaseId>
async function precioDecant(pool, { productoId, envaseId }) {
    const cat = await catalogoParaCobrar(pool);
    const productos = await fichas(pool, [productoId]);
    const l = lineaDecant(cat, productos, productoId, envaseId);
    return {
        title: `${l.nombre} · Decant ${ML} ml · ${l.envase.nombre}`,
        description: 'Decant de 10 ml',
        picture_url: productos.get(productoId).imagen || l.envase.imagen || '',
        unit_price: l.precio,
        recetas: [l.recipe]
    };
}

// dset_<setId>_<envaseId>_<productoId>-<productoId>-…
async function precioSet(pool, { setId, envaseId, productoIds }) {
    const cat = await catalogoParaCobrar(pool);
    const set = cat.sets.find((s) => s.id === setId);
    if (!set) throw new ErrorPrecio('El set de decants elegido ya no está disponible.');
    if (productoIds.length !== set.cantidad) throw new ErrorPrecio(`El ${set.nombre.toLowerCase()} lleva ${set.cantidad} fragancias.`);
    if (new Set(productoIds).size !== productoIds.length) throw new ErrorPrecio('Cada fragancia del set debe ser distinta.');
    const productos = await fichas(pool, productoIds);
    const lineas = productoIds.map((id) => lineaDecant(cat, productos, id, envaseId));
    const suma = lineas.reduce((s, l) => s + l.precio, 0);
    const total = Math.round((suma * (100 - set.descuento)) / 100 / 100) * 100;
    return {
        title: `${set.nombre} · ${set.cantidad} decants de ${ML} ml`,
        description: lineas.map((l) => l.nombre).join(' · ').substring(0, 250),
        picture_url: lineas[0].envase.imagen || '',
        unit_price: total,
        suma,
        recetas: lineas.map((l) => l.recipe)
    };
}

// ── Enlace fragancia ↔ esencia (panel) ──
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
// «Esencia Amber Rouge (Orientica)» → { nombre: 'Amber Rouge', marca: 'Orientica' }
function partesEsencia(nombre) {
    const sin = String(nombre).replace(/^esencia\s+/i, '').trim();
    const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(sin);
    return m ? { nombre: m[1], marca: m[2] } : { nombre: sin, marca: '' };
}

function sugerir(producto, esencias) {
    const nom = norm(producto.nombre).join(' ');
    const marca = norm(producto.marca).join(' ');
    const conPartes = esencias.map((e) => ({ ...e, ...partesEsencia(e.name) }));
    const exactas = conPartes.filter((e) => norm(e.nombre).join(' ') === nom);
    const conMarca = exactas.filter((e) => !e.marca || !marca || norm(e.marca).join(' ') === marca);
    if (conMarca.length === 1) return { exacta: conMarca[0], candidatas: [] };
    if (exactas.length === 1 && !marca) return { exacta: exactas[0], candidatas: [] };
    // Parciales: todas las palabras de la esencia están en el nombre (+ marca) de la fragancia
    const palabras = new Set([...norm(producto.nombre), ...norm(producto.marca)]);
    const candidatas = conPartes.filter((e) => {
        const p = norm(e.nombre);
        return p.length && p.every((w) => palabras.has(w));
    }).slice(0, 4);
    return { exacta: null, candidatas: exactas.length ? exactas.slice(0, 4) : candidatas };
}

async function resumenAdmin(pool) {
    const cfg = await leerConfig(pool, { todos: true });
    let data = null;
    let errorData = null;
    if (bridge.habilitado()) {
        try { data = await bridge.obtenerDecants({ fresco: true }); } catch (err) { errorData = err.message; }
    } else errorData = 'La integración con DATA no está configurada.';
    const [productos] = await pool.query(`SELECT p.id, p.nombre, p.categoria, p.imagen, p.activo, p.esencia_inventario_id AS esencia,
        ${await tieneMarcas(pool) ? 'm.nombre' : 'NULL'} AS marca
        FROM Productos p ${await tieneMarcas(pool) ? 'LEFT JOIN marcas m ON m.id = p.marca_id' : ''}
        ORDER BY p.nombre`);
    const esencias = data && data.disponible ? data.esencias : [];
    const porEsencia = new Map(esencias.map((e) => [e.id, e]));
    const enlazadas = new Set(productos.map((p) => Number(p.esencia)).filter(Boolean));
    return {
        config: cfg,
        data: data && data.disponible ? { recetaLista: data.recetaLista, esenciaMl: data.esenciaMl, envases: data.envases } : null,
        errorData: data && !data.disponible ? 'DATA aún no tiene la migración de decants (014).' : errorData,
        esencias: esencias.map((e) => ({ id: e.id, name: e.name, clase: e.clase, stockMl: e.stockMl, decants: e.decants, enlazada: enlazadas.has(e.id) })),
        productos: productos.map((p) => {
            const es = p.esencia ? porEsencia.get(Number(p.esencia)) : null;
            const sug = !p.esencia && esencias.length ? sugerir(p, esencias) : null;
            return {
                id: p.id, nombre: p.nombre, marca: p.marca, categoria: categoriaPrecio(p.categoria), imagen: p.imagen, activo: Boolean(p.activo),
                esencia: p.esencia ? { id: Number(p.esencia), name: es ? es.name : `#${p.esencia} (no está en DATA)`, decants: es ? es.decants : 0, stockMl: es ? es.stockMl : 0 } : null,
                sugerencia: sug && sug.exacta ? { id: sug.exacta.id, name: sug.exacta.name, exacta: true } : null,
                candidatas: sug ? sug.candidatas.map((c) => ({ id: c.id, name: c.name })) : []
            };
        })
    };
}

let marcasCache = null;
async function tieneMarcas(pool) {
    if (marcasCache !== null) return marcasCache;
    const [r] = await pool.query("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marcas'");
    marcasCache = r.length > 0;
    return marcasCache;
}

module.exports = { ML, catalogo, precioDecant, precioSet, leerConfig, resumenAdmin, partesEsencia, sugerir };

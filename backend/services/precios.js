// ============================================================
// Precios del catálogo unificado (fuente de verdad para cobrar)
// ------------------------------------------------------------
// · Perfume armado ("Crea tu perfume") = esencia (tabla por categoría y tamaño)
//   + envase (precio del diseño en ese tamaño) + recargo de feromonas si las pide.
//   La concentración la fija DATA; el cliente no la elige.
// · Insumo = ítem de DATA marcado como visible en la web. Si DATA lo mide en ml,
//   su precio es por ml y se vende en presentaciones (30, 50, 100 ml…).
// Un precio sin definir (NULL) no se cobra: la tienda lo muestra como "Consultar".
// ============================================================
const bridge = require('./dataBridge');

const CATEGORIAS = ['Arabe', 'Diseñador'];
const TIPOS_INSUMO = ['esencia', 'base', 'feromona', 'envase', 'accesorio'];
const PRESENTACIONES_BASE = [30, 50, 100];

// Categoría de precio de una fragancia: árabe o diseñador (DATA la llama "tradicional")
const categoriaPrecio = (c) => (/arab/i.test(String(c || '')) ? 'Arabe' : 'Diseñador');
const claveEnvase = (nombre) => String(nombre || '').trim().toUpperCase();
const ml = (talla) => parseInt(String(talla).replace(/\D/g, ''), 10) || null;
const numeroONulo = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Math.round(Number(v)));

class ErrorPrecio extends Error {
    constructor(mensaje, status = 400) { super(mensaje); this.status = status; }
}

async function leerParametros(pool) {
    const [rows] = await pool.query('SELECT clave, valor FROM ParametrosTienda');
    const p = Object.fromEntries(rows.map((r) => [r.clave, r.valor]));
    const presentaciones = String(p.presentaciones_ml || '').split(',').map((x) => parseInt(x, 10)).filter((x) => x > 0);
    return {
        recargoFeromonas: numeroONulo(p.recargo_feromonas),
        presentaciones: presentaciones.length ? [...new Set(presentaciones)].sort((a, b) => a - b) : PRESENTACIONES_BASE
    };
}

// Configuración completa del armador: envases únicos (por nombre) con sus tallas y precios
async function configuracionArmador(pool) {
    const [envases] = await pool.query(`
        SELECT e.id, e.nombre, e.imagen, e.material, e.descripcion,
            GROUP_CONCAT(t.talla ORDER BY t.talla SEPARATOR ',') AS tallas
        FROM Envases e
        LEFT JOIN EnvaseTallas t ON t.envase_id = e.id
        WHERE e.activo = 1
        GROUP BY e.id
        ORDER BY e.id`);
    const [preciosEnvase] = await pool.query('SELECT envase, ml, precio FROM PreciosEnvase');
    const [preciosEsencia] = await pool.query('SELECT categoria, ml, precio FROM PreciosEsencia');
    const parametros = await leerParametros(pool);

    const precioEnvase = new Map(preciosEnvase.map((r) => [`${r.envase}|${r.ml}`, numeroONulo(r.precio)]));
    const vistos = new Set();
    const lista = [];
    for (const e of envases) {
        const clave = claveEnvase(e.nombre);
        if (!clave || vistos.has(clave)) continue; // La tabla tiene diseños repetidos: el primero manda
        vistos.add(clave);
        const tamanos = [...new Set(String(e.tallas || '').split(',').map(ml).filter(Boolean))].sort((a, b) => a - b);
        lista.push({
            id: e.id, name: e.nombre, image: e.imagen, material: e.material, description: e.descripcion,
            sizes: tamanos.map((m) => ({ ml: m, price: precioEnvase.has(`${clave}|${m}`) ? precioEnvase.get(`${clave}|${m}`) : null }))
        });
    }

    const tamanosTodos = [...new Set(lista.flatMap((e) => e.sizes.map((s) => s.ml)))].sort((a, b) => a - b);
    const esencia = Object.fromEntries(CATEGORIAS.map((c) => [c, {}]));
    preciosEsencia.forEach((r) => {
        if (esencia[r.categoria]) esencia[r.categoria][r.ml] = numeroONulo(r.precio);
    });
    return { envases: lista, esencia, tamanos: tamanosTodos, ...parametros };
}

// Precio de un perfume armado. Lanza ErrorPrecio si la combinación no existe o no tiene precio.
async function precioArmado(pool, { productoId, ml: tamano, envaseId, feromonas }) {
    const [prods] = await pool.query('SELECT id, nombre, categoria, imagen, activo FROM Productos WHERE id = ?', [productoId]);
    const prod = prods[0];
    if (!prod || !prod.activo) throw new ErrorPrecio(`La fragancia elegida ya no está disponible (ID: ${productoId}).`);

    const config = await configuracionArmador(pool);
    const [envRows] = await pool.query('SELECT nombre FROM Envases WHERE id = ?', [envaseId]);
    const envase = envRows[0] && config.envases.find((e) => claveEnvase(e.name) === claveEnvase(envRows[0].nombre));
    if (!envase) throw new ErrorPrecio('El envase elegido ya no está disponible.');
    const talla = envase.sizes.find((s) => s.ml === tamano);
    if (!talla) throw new ErrorPrecio(`El envase ${envase.name} no viene en ${tamano} ml.`);

    const categoria = categoriaPrecio(prod.categoria);
    const esencia = config.esencia[categoria] ? config.esencia[categoria][tamano] : null;
    const recargo = feromonas ? config.recargoFeromonas : 0;
    if (esencia == null || talla.price == null || recargo == null) {
        throw new ErrorPrecio(`${prod.nombre} en ${envase.name} de ${tamano} ml aún no tiene precio en línea. Escríbenos por WhatsApp para cotizarlo.`, 409);
    }
    return {
        title: `${prod.nombre} · ${envase.name} ${tamano} ml${feromonas ? ' · con feromonas' : ''}`,
        description: `Perfume preparado (${categoria === 'Arabe' ? 'Árabe' : 'Diseñador'})`,
        picture_url: envase.image || prod.imagen || '',
        unit_price: esencia + talla.price + recargo,
        desglose: { esencia, envase: talla.price, feromonas: recargo }
    };
}

// Insumos visibles en la web con los datos vivos de DATA (nombre, precio, stock, tipo, unidad)
async function listarInsumos(pool, { todos = false } = {}) {
    if (!bridge.habilitado()) return { disponible: false, insumos: [] };
    const inventario = await bridge.obtenerInventario();
    const [fichas] = await pool.query('SELECT inventario_id, visible, imagen, descripcion, orden FROM InsumosWeb');
    const porId = new Map(fichas.map((f) => [Number(f.inventario_id), f]));
    const { presentaciones } = await leerParametros(pool);
    const insumos = inventario
        .filter((i) => TIPOS_INSUMO.includes(i.type))
        .map((i) => {
            const f = porId.get(Number(i.id)) || {};
            const porMl = i.unit === 'ml';
            return {
                id: Number(i.id), name: i.name, type: i.type, unit: i.unit, category: i.category || null,
                price: Number(i.price) || 0, stock: Number(i.stock) || 0,
                agotado: Number(i.stock) <= 0, revision: Boolean(i.priceReview),
                visible: Boolean(f.visible), image: f.imagen || null, description: f.descripcion || null, orden: Number(f.orden) || 0,
                presentaciones: porMl ? presentaciones : null
            };
        })
        .filter((i) => todos || (i.visible && i.price > 0))
        .sort((a, b) => a.orden - b.orden || a.name.localeCompare(b.name));
    return { disponible: true, insumos };
}

// Precio de un insumo: por unidad, o por presentación en ml (precio por ml × ml)
async function precioInsumo(pool, { inventarioId, ml: presentacion }) {
    if (!bridge.habilitado()) throw new ErrorPrecio('Los insumos no están disponibles en este momento. Escríbenos por WhatsApp.', 503);
    const { insumos } = await listarInsumos(pool);
    const ins = insumos.find((i) => i.id === inventarioId);
    if (!ins) throw new ErrorPrecio(`El insumo elegido ya no está disponible (ID: ${inventarioId}).`);
    if (ins.revision) throw new ErrorPrecio(`${ins.name} está en revisión de precio y no se puede comprar en este momento.`, 409);
    if (ins.unit === 'ml') {
        if (!ins.presentaciones.includes(presentacion)) throw new ErrorPrecio(`${ins.name} no se vende en ${presentacion} ml.`);
        return {
            title: `${ins.name} · ${presentacion} ml`, description: 'Insumo', picture_url: ins.image || '',
            unit_price: Math.round(ins.price * presentacion),
            // En DATA la venta descuenta ml: cantidad en ml y precio por ml
            inventario_id: ins.id, data_por_unidad: presentacion, data_precio: ins.price
        };
    }
    return { title: ins.name, description: 'Insumo', picture_url: ins.image || '', unit_price: Math.round(ins.price), inventario_id: ins.id };
}

module.exports = {
    CATEGORIAS, TIPOS_INSUMO, ErrorPrecio, categoriaPrecio, claveEnvase, numeroONulo,
    configuracionArmador, precioArmado, listarInsumos, precioInsumo, leerParametros
};

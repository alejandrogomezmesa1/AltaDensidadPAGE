// ============================================================
// Sincronización automática Web ⇄ DATA
// ------------------------------------------------------------
// · DATA → Web: stock y precio de los productos/kits enlazados (inventario_id).
//   Sin stock ⇒ agotado = 1 (la tienda lo muestra agotado y no deja pagarlo).
// · Web → DATA: cada orden aprobada se registra como venta (cliente, detalle,
//   pago y descuento de stock). Si luego se cancela o reembolsa, se anula.
// · Si DATA no responde, la orden queda en 'error' y se reintenta sola.
// ============================================================
const { getConnection } = require('../config/db');
const bridge = require('./dataBridge');
const esquema = require('./esquema');

const INTERVALO_MS = Math.max(15000, parseInt(process.env.DATA_SYNC_INTERVAL_MS || '60000', 10));
const SINCRONIZAR_PRECIOS = process.env.DATA_SYNC_PRECIOS !== '0';
const ESTADOS_ANULADOS = ['failed', 'cancelled', 'refunded'];

let columnasListas = false;
const estado = { ultimaSync: null, ultimoError: null };
const enCurso = new Set();

// ------------------------------------------------------------
// DATA → Web: stock y precios
// ------------------------------------------------------------
async function sincronizarCatalogo() {
    if (!bridge.habilitado() || !columnasListas) return;
    const inventario = await bridge.obtenerInventario({ fresco: true });
    const porId = new Map(inventario.map(i => [Number(i.id), i]));
    const pool = await getConnection();

    for (const tabla of ['Productos', 'Kits']) {
        // Precio en revisión: DATA avisa cuando el precio de venta no cubre el costo (la tienda no lo vende)
        const conRevision = esquema.clasificacion();
        const [filas] = await pool.query(`SELECT id, precio, agotado, inventario_id${conRevision ? ', precio_revision' : ''} FROM ${tabla} WHERE inventario_id IS NOT NULL`);
        for (const f of filas) {
            const inv = porId.get(Number(f.inventario_id));
            if (!inv) continue; // El ítem ya no existe en DATA: no se toca
            const agotado = inv.stock <= 0 ? 1 : 0;
            const precio = SINCRONIZAR_PRECIOS && inv.price > 0 ? inv.price : Number(f.precio);
            const revision = inv.priceReview ? 1 : 0;
            const cambioRevision = conRevision && revision !== Number(f.precio_revision);
            if (agotado !== Number(f.agotado) || precio !== Number(f.precio) || cambioRevision) {
                if (conRevision) {
                    await pool.query(`UPDATE ${tabla} SET agotado = ?, precio = ?, precio_revision = ? WHERE id = ?`, [agotado, precio, revision, f.id]);
                } else {
                    await pool.query(`UPDATE ${tabla} SET agotado = ?, precio = ? WHERE id = ?`, [agotado, precio, f.id]);
                }
            }
        }
    }
    estado.ultimaSync = new Date().toISOString();
    estado.ultimoError = null;
}

// ------------------------------------------------------------
// Resolver inventario_id de las líneas de una orden / carrito
// ------------------------------------------------------------
async function mapearInventario(pool, items) {
    const prodIds = [];
    const kitIds = [];
    const mapa = new Map();
    for (const it of items) {
        const id = String(it.id || '');
        if (id.startsWith('ins_') && it.inventario_id) mapa.set(id, Number(it.inventario_id));
        else if (id.startsWith('kit_')) kitIds.push(parseInt(id.slice(4), 10));
        else if (/^\d+$/.test(id)) prodIds.push(parseInt(id, 10));
    }
    if (prodIds.length) {
        const [rows] = await pool.query('SELECT id, inventario_id FROM Productos WHERE id IN (?)', [prodIds]);
        rows.forEach(r => r.inventario_id && mapa.set(String(r.id), r.inventario_id));
    }
    if (kitIds.length) {
        const [rows] = await pool.query('SELECT id, inventario_id FROM Kits WHERE id IN (?)', [kitIds]);
        rows.forEach(r => r.inventario_id && mapa.set(`kit_${r.id}`, r.inventario_id));
    }
    return mapa;
}

// Verificación antes de cobrar. Devuelve los títulos sin stock suficiente.
// Si DATA no responde, se usa el último estado sincronizado (columna agotado).
async function verificarDisponibilidad(pool, mpItems) {
    if (!columnasListas) return [];
    const mapa = await mapearInventario(pool, mpItems);
    const vinculados = mpItems.filter(it => mapa.has(String(it.id)));
    if (!vinculados.length) return [];

    if (bridge.habilitado()) {
        try {
            const r = await bridge.verificarStock(vinculados.map(it => ({ inventoryId: mapa.get(String(it.id)), quantity: it.data_cantidad || it.quantity })));
            const faltan = new Set((r.faltantes || []).map(f => Number(f.inventoryId)));
            return vinculados.filter(it => faltan.has(Number(mapa.get(String(it.id))))).map(it => it.title);
        } catch (err) {
            console.warn('[DATA] Verificación de stock en vivo falló, se usa el último estado:', err.message);
        }
    }

    // Sin DATA en vivo, los insumos no tienen estado guardado en la web: se dejan pasar
    const prodIds = vinculados.filter(it => /^\d+$/.test(String(it.id))).map(it => parseInt(it.id, 10));
    const kitIds = vinculados.filter(it => String(it.id).startsWith('kit_')).map(it => parseInt(String(it.id).slice(4), 10));
    const agotados = new Set();
    if (prodIds.length) {
        const [rows] = await pool.query('SELECT id FROM Productos WHERE agotado = 1 AND id IN (?)', [prodIds]);
        rows.forEach(r => agotados.add(String(r.id)));
    }
    if (kitIds.length) {
        const [rows] = await pool.query('SELECT id FROM Kits WHERE agotado = 1 AND id IN (?)', [kitIds]);
        rows.forEach(r => agotados.add(`kit_${r.id}`));
    }
    return vinculados.filter(it => agotados.has(String(it.id))).map(it => it.title);
}

// ------------------------------------------------------------
// Web → DATA: ventas y anulaciones
// ------------------------------------------------------------
async function marcar(pool, ref, estadoSync, extra = {}) {
    await pool.query(
        'UPDATE Ordenes SET data_sync_estado = ?, data_venta_id = COALESCE(?, data_venta_id), data_sync_error = ?, data_sync_at = NOW() WHERE external_reference = ?',
        [estadoSync, extra.ventaId || null, extra.error ? String(extra.error).substring(0, 250) : null, ref]
    );
}

async function sincronizarOrden(ref) {
    if (!ref || !bridge.habilitado() || !columnasListas || enCurso.has(ref)) return;
    enCurso.add(ref);
    const pool = await getConnection();
    try {
        const [rows] = await pool.query('SELECT * FROM Ordenes WHERE external_reference = ? LIMIT 1', [ref]);
        const orden = rows[0];
        if (!orden || orden.data_sync_estado === 'omitida') return;

        const sincronizada = orden.data_sync_estado === 'synced';

        if (orden.status === 'approved' && !sincronizada) {
            const items = typeof orden.items === 'string' ? JSON.parse(orden.items || '[]') : (orden.items || []);
            const mapa = await mapearInventario(pool, items);
            const direccion = [orden.envio_direccion, orden.envio_piso, orden.envio_barrio].filter(Boolean).join(', ');
            const r = await bridge.registrarVenta({
                externalReference: ref,
                method: 'Mercado Pago (Web)',
                customer: {
                    name: orden.envio_nombre || orden.payer_name || 'Cliente Web',
                    document: orden.envio_documento,
                    phone: orden.envio_celular,
                    city: orden.envio_ciudad,
                    address: direccion
                },
                items: items.map(it => ({
                    inventoryId: mapa.get(String(it.id)) || null,
                    // Insumos por ml: DATA descuenta ml y cobra por ml
                    quantity: it.data_cantidad || it.quantity,
                    unitPrice: it.data_precio ?? it.unit_price,
                    description: it.title
                }))
            });
            await marcar(pool, ref, 'synced', { ventaId: r.saleId });
            sincronizarCatalogo().catch(() => {});
        } else if (ESTADOS_ANULADOS.includes(orden.status) && sincronizada) {
            await bridge.anularVenta(ref);
            await marcar(pool, ref, 'cancelled');
            sincronizarCatalogo().catch(() => {});
        }
    } catch (err) {
        console.error(`[DATA] No se pudo sincronizar la orden ${ref}:`, err.message);
        await marcar(pool, ref, 'error', { error: err.message }).catch(() => {});
    } finally {
        enCurso.delete(ref);
    }
}

// Útil cuando Mercado Pago solo trae preference_id
async function sincronizarPorPreferencia(preferenceId) {
    if (!preferenceId || !columnasListas) return;
    const pool = await getConnection();
    const [rows] = await pool.query('SELECT external_reference FROM Ordenes WHERE preference_id = ? LIMIT 1', [preferenceId]);
    if (rows[0]) await sincronizarOrden(rows[0].external_reference);
}

// Reintenta órdenes aprobadas sin registrar y anulaciones pendientes
async function reintentarPendientes() {
    if (!bridge.habilitado() || !columnasListas) return;
    const pool = await getConnection();
    const [rows] = await pool.query(`
        SELECT external_reference FROM Ordenes
        WHERE (status = 'approved' AND (data_sync_estado IS NULL OR data_sync_estado = 'error'))
           OR (status IN ('failed','cancelled','refunded') AND data_sync_estado = 'synced')
        ORDER BY id ASC LIMIT 25`);
    for (const r of rows) await sincronizarOrden(r.external_reference);
}

async function ciclo() {
    try {
        await sincronizarCatalogo();
        await reintentarPendientes();
    } catch (err) {
        estado.ultimoError = err.message;
        console.error('[DATA] Error en sincronización:', err.message);
    }
}

// El esquema lo prepara la migración 004 (backend/migrations); aquí solo se arranca el ciclo
async function iniciar(pool, esquemaListo) {
    columnasListas = Boolean(esquemaListo);
    if (!columnasListas) {
        console.error('[DATA] Esquema de integración no disponible (revisa las migraciones): integración deshabilitada.');
        return;
    }
    if (!bridge.habilitado()) {
        console.warn('[DATA] Integración deshabilitada: define DATA_INTERNAL_URL y DATA_INTEGRATION_SECRET (≥32 caracteres).');
        return;
    }
    console.log(`[DATA] Integración activa. Sincronización cada ${INTERVALO_MS / 1000}s.`);
    ciclo();
    setInterval(ciclo, INTERVALO_MS).unref();
}

async function resumen() {
    const info = { habilitada: bridge.habilitado(), sincronizaPrecios: SINCRONIZAR_PRECIOS, ...estado, ordenes: {} };
    if (!columnasListas) return info;
    const pool = await getConnection();
    const [rows] = await pool.query("SELECT COALESCE(data_sync_estado, 'sin_enviar') AS e, COUNT(*) AS n FROM Ordenes WHERE status = 'approved' GROUP BY e");
    rows.forEach(r => { info.ordenes[r.e] = r.n; });
    return info;
}

module.exports = {
    iniciar,
    ciclo,
    resumen,
    sincronizarCatalogo,
    sincronizarOrden,
    sincronizarPorPreferencia,
    verificarDisponibilidad,
    columnasListas: () => columnasListas
};

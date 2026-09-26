// ============================================================
// Puente privado hacia el sistema DATA (inventario / ventas / clientes)
// ------------------------------------------------------------
// Solo el backend lo usa: el navegador nunca conoce la URL ni el secreto de DATA.
// La conexión va por la red privada de Railway (DATA_INTERNAL_URL, p. ej.
// http://altadensidaddata.railway.internal:7070) y cada petición se firma con
// HMAC-SHA256 + timestamp + nonce (DATA_INTEGRATION_SECRET).
// ============================================================
const crypto = require('crypto');

const BASE_URL = (process.env.DATA_INTERNAL_URL || '').replace(/\/+$/, '');
const SECRET = process.env.DATA_INTEGRATION_SECRET || '';
const TIMEOUT_MS = parseInt(process.env.DATA_TIMEOUT_MS || '5000', 10);
const INVENTARIO_TTL_MS = 30 * 1000;

let cacheInventario = null;

function habilitado() {
    return Boolean(BASE_URL && SECRET.length >= 32);
}

async function llamar(method, ruta, body, timeoutMs = TIMEOUT_MS) {
    if (!habilitado()) throw new Error('Integración DATA no configurada');

    const path = `/internal/v1${ruta}`;
    const payload = body === undefined ? '' : JSON.stringify(body);
    const ts = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const bodyHash = crypto.createHash('sha256').update(payload).digest('hex');
    const firma = crypto.createHmac('sha256', SECRET)
        .update([ts, nonce, method, path, bodyHash].join('\n'))
        .digest('hex');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const resp = await fetch(BASE_URL + path, {
            method,
            headers: {
                ...(payload ? { 'Content-Type': 'application/json' } : {}),
                'x-ad-timestamp': String(ts),
                'x-ad-nonce': nonce,
                'x-ad-signature': firma
            },
            body: payload || undefined,
            signal: controller.signal
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(`DATA respondió ${resp.status}${data.error ? ': ' + data.error : ''}`);
        return data;
    } catch (err) {
        if (err.name === 'AbortError') throw new Error('DATA no respondió a tiempo');
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

// Inventario (id, name, price, stock) con caché corta para no saturar DATA
async function obtenerInventario({ fresco = false } = {}) {
    if (!fresco && cacheInventario && cacheInventario.expira > Date.now()) return cacheInventario.data;
    const data = await llamar('GET', '/inventory');
    cacheInventario = { data, expira: Date.now() + INVENTARIO_TTL_MS };
    return data;
}

// items: [{ inventoryId, quantity }] → { ok, faltantes: [{ inventoryId, requested, available }] }
async function verificarStock(items) {
    return llamar('POST', '/inventory/check', { items }, 3000);
}

async function registrarVenta(venta) {
    const r = await llamar('POST', '/sales', venta);
    cacheInventario = null;
    return r;
}

async function anularVenta(externalReference) {
    const r = await llamar('POST', `/sales/${encodeURIComponent(externalReference)}/cancel`, {});
    cacheInventario = null;
    return r;
}

module.exports = { habilitado, obtenerInventario, verificarStock, registrarVenta, anularVenta };

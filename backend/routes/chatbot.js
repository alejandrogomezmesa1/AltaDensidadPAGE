const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// ============================================================
// PROXY DEL ASISTENTE AURA
// El navegador solo habla con /api/chatbot. La URL y la API key del
// proveedor de IA viven en el servidor y se pueden cambiar sin redesplegar:
//   1) Base de datos (tabla ConfigChatbot) — editable con PUT /api/chatbot/config
//   2) Variables de entorno (respaldo): CHATBOT_API_URL, CHATBOT_API_KEY,
//      CHATBOT_MODO (nativo | openai), CHATBOT_MODELO
// Modos:
//   nativo -> POST {url}/chat                 { message, session_id }
//   openai -> POST {url}/v1/chat/completions  { model, messages }  (cualquier API compatible)
// ============================================================

const TIMEOUT_MS = parseInt(process.env.CHATBOT_TIMEOUT_MS || '60000', 10);
const CONFIG_TTL_MS = 30 * 1000;
const CATALOGO_TTL_MS = 5 * 60 * 1000;
const ESTADO_TTL_MS = 30 * 1000;
const MODOS = ['nativo', 'openai'];
const MAX_MENSAJE = 800;

// ---------- Cifrado de la API key en la base de datos ----------
// AES-256-GCM con una clave derivada de CHATBOT_CONFIG_SECRET (o JWT_SECRET)
function claveCifrado() {
    const secreto = process.env.CHATBOT_CONFIG_SECRET || process.env.JWT_SECRET || '';
    if (!secreto) return null;
    return crypto.createHash('sha256').update('aura-chatbot:' + secreto).digest();
}

function cifrar(texto) {
    const clave = claveCifrado();
    if (!clave) throw new Error('Define CHATBOT_CONFIG_SECRET o JWT_SECRET para guardar la API key cifrada');
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv('aes-256-gcm', clave, iv);
    const datos = Buffer.concat([c.update(String(texto), 'utf8'), c.final()]);
    return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), datos.toString('base64')].join(':');
}

function descifrar(valor) {
    if (!valor) return '';
    const [v, iv, tag, datos] = String(valor).split(':');
    const clave = claveCifrado();
    if (v !== 'v1' || !clave) return '';
    try {
        const d = crypto.createDecipheriv('aes-256-gcm', clave, Buffer.from(iv, 'base64'));
        d.setAuthTag(Buffer.from(tag, 'base64'));
        return Buffer.concat([d.update(Buffer.from(datos, 'base64')), d.final()]).toString('utf8');
    } catch (e) {
        console.error('[chatbot] No se pudo descifrar la API key guardada (¿cambió el secreto?)');
        return '';
    }
}

function enmascarar(key) {
    if (!key) return null;
    return key.length <= 8 ? '••••' : key.slice(0, 4) + '••••' + key.slice(-4);
}

// ---------- Configuración (BD con respaldo en variables de entorno) ----------
let tablaLista = false;
async function asegurarTabla(pool) {
    if (tablaLista) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ConfigChatbot (
            id TINYINT PRIMARY KEY,
            url VARCHAR(500) NULL,
            api_key_cifrada TEXT NULL,
            modo VARCHAR(20) NOT NULL DEFAULT 'nativo',
            modelo VARCHAR(120) NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            actualizado_en DATETIME NULL,
            actualizado_por VARCHAR(120) NULL
        )
    `);
    tablaLista = true;
}

let cacheConfig = null;
let cacheConfigEn = 0;

function limpiarUrl(u) {
    let limpia = String(u || '').trim().replace(/\/+$/, '');
    if (limpia.endsWith('/chat')) {
        limpia = limpia.slice(0, -5).replace(/\/+$/, '');
    }
    return limpia;
}

function configDesdeEntorno() {
    return {
        url: limpiarUrl(process.env.CHATBOT_API_URL || ''),
        apiKey: (process.env.CHATBOT_API_KEY || '').trim(),
        modo: MODOS.includes(process.env.CHATBOT_MODO) ? process.env.CHATBOT_MODO : 'nativo',
        modelo: process.env.CHATBOT_MODELO || '',
        activo: true,
        origen: 'entorno',
        actualizadoEn: null,
        actualizadoPor: null
    };
}

async function obtenerConfig(forzar) {
    if (!forzar && cacheConfig && Date.now() - cacheConfigEn < CONFIG_TTL_MS) return cacheConfig;
    const entorno = configDesdeEntorno();
    let cfg = entorno;
    try {
        const pool = await getConnection();
        await asegurarTabla(pool);
        const [rows] = await pool.query('SELECT * FROM ConfigChatbot WHERE id = 1');
        if (rows.length) {
            const r = rows[0];
            cfg = {
                url: limpiarUrl(r.url || entorno.url || ''),
                apiKey: descifrar(r.api_key_cifrada) || entorno.apiKey,
                modo: MODOS.includes(r.modo) ? r.modo : entorno.modo,
                modelo: r.modelo || entorno.modelo,
                activo: !!r.activo,
                origen: 'base de datos',
                actualizadoEn: r.actualizado_en,
                actualizadoPor: r.actualizado_por
            };
        }
    } catch (e) {
        console.error('[chatbot] No se pudo leer ConfigChatbot, uso variables de entorno:', e.message);
    }
    cacheConfig = cfg;
    cacheConfigEn = Date.now();
    return cfg;
}

// Si el proveedor rechazó la key, /health seguiría diciendo "ok": lo recordamos hasta que cambie la config
let fallaAutenticacion = false;

function invalidarCaches() {
    cacheConfig = null;
    cacheEstado = null;
    fallaAutenticacion = false;
}

// ---------- Catálogo real para verificar las respuestas ----------
let cacheCatalogo = null;
let cacheCatalogoEn = 0;

const normalizar = (s) => String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]/g, '');

async function obtenerCatalogo() {
    if (cacheCatalogo && Date.now() - cacheCatalogoEn < CATALOGO_TTL_MS) return cacheCatalogo;
    try {
        const pool = await getConnection();
        const [rows] = await pool.query(
            'SELECT id, nombre, precio, imagen, categoria, genero FROM Productos WHERE activo = 1'
        );
        cacheCatalogo = rows.map(p => ({
            id: p.id,
            name: p.nombre,
            price: Number(p.precio),
            image: p.imagen,
            category: p.categoria,
            gender: p.genero,
            clave: normalizar(p.nombre)
        }));
        cacheCatalogoEn = Date.now();
    } catch (e) {
        console.error('[chatbot] No se pudo cargar el catálogo para verificar respuestas:', e.message);
        if (!cacheCatalogo) cacheCatalogo = [];
    }
    return cacheCatalogo;
}

function buscarEnCatalogo(catalogo, nombre) {
    const clave = normalizar(nombre);
    if (clave.length < 4) return null;
    // Exacto primero; luego solo coincidencias parciales largas para no confundir "EROS" con "EROS FLAME"
    return catalogo.find(p => p.clave === clave) ||
        catalogo.find(p => clave.length >= 8 && p.clave.startsWith(clave)) ||
        catalogo.find(p => p.clave.length >= 8 && clave.startsWith(p.clave) && clave.length - p.clave.length <= 8) ||
        null;
}

const fmtCOP = (n) => '$' + Number(n).toLocaleString('es-CO') + ' COP';

// Revisa cada línea "- **NOMBRE** ... $precio": si el producto no existe se elimina,
// si existe se corrige el precio con el de la base de datos.
function verificarRespuesta(texto, catalogo) {
    if (!texto || !catalogo.length) return { texto, productos: [], eliminados: [] };
    const productos = [];
    const eliminados = [];
    const lineas = String(texto).split('\n');
    const salida = [];
    let habiaListado = false;

    for (const linea of lineas) {
        const m = linea.match(/^\s*[-*•]\s*\*\*(.+?)\*\*/);
        if (!m) {
            salida.push(linea);
            continue;
        }
        habiaListado = true;
        const prod = buscarEnCatalogo(catalogo, m[1]);
        if (!prod) {
            eliminados.push(m[1]);
            continue;
        }
        if (!productos.some(p => p.id === prod.id)) productos.push(prod);
        salida.push(linea.replace(/\$\s?[\d.,]+(\s*COP)?/i, fmtCOP(prod.price)));
    }

    let final = salida.join('\n').trim();
    if (habiaListado && !productos.length) {
        final = 'No encontré referencias exactas en nuestro catálogo para eso. ¿Buscas algo para **dama**, **caballero** o alguna nota en particular (dulce, fresca, amaderada)?';
    }
    return { texto: final, productos, eliminados };
}

// ---------- Llamada al proveedor ----------
const SISTEMA = `Eres AURA, asesora olfativa de Fragancias de Alta Densidad (Medellín, Colombia).
Perfumes en concentración pura Extrait de Parfum y base de feromonas, fijación de 12 horas o más en piel.
Envíos: Medellín $15.000, Área Metropolitana $20.000, resto de Colombia $22.000.
Pagos: Mercado Pago (PSE, Nequi, tarjetas) o por WhatsApp. WhatsApp: +57 304 647 7694.
Responde en español, breve y cálido. SOLO recomienda productos del catálogo que se te entrega,
con su precio exacto, en líneas con el formato "- **NOMBRE**: $precio COP". Si no está en el catálogo, dilo.`;

// Historial corto por sesión para proveedores sin memoria propia (modo openai)
const historiales = new Map();
function historialDe(sessionId) {
    const h = historiales.get(sessionId);
    if (h && Date.now() - h.en < 30 * 60 * 1000) return h.msgs;
    return [];
}
function guardarHistorial(sessionId, msgs) {
    if (!sessionId) return;
    historiales.set(sessionId, { msgs: msgs.slice(-10), en: Date.now() });
    if (historiales.size > 500) historiales.delete(historiales.keys().next().value);
}

async function llamarProveedor(cfg, mensaje, sessionId) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const headers = { 'Content-Type': 'application/json' };
    if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;

    try {
        if (cfg.modo === 'openai') {
            const catalogo = await obtenerCatalogo();
            const lista = catalogo.map(p => `${p.name} | ${fmtCOP(p.price)} | ${p.category || ''} | ${p.gender || ''}`).join('\n');
            const previos = historialDe(sessionId);
            const messages = [
                { role: 'system', content: SISTEMA + '\n\nCATÁLOGO:\n' + lista },
                ...previos,
                { role: 'user', content: mensaje }
            ];
            const r = await fetch(`${cfg.url}/v1/chat/completions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ model: cfg.modelo || undefined, messages, temperature: 0.4 }),
                signal: controller.signal
            });
            if (!r.ok) throw Object.assign(new Error(`Proveedor respondió ${r.status}`), { status: r.status });
            const data = await r.json();
            const texto = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            if (!texto) throw new Error('Respuesta vacía del proveedor');
            guardarHistorial(sessionId, [...previos, { role: 'user', content: mensaje }, { role: 'assistant', content: texto }]);
            return { texto, sessionId };
        }

        const payload = { message: mensaje };
        if (sessionId) payload.session_id = sessionId;
        const r = await fetch(`${cfg.url}/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        if (!r.ok) throw Object.assign(new Error(`Proveedor respondió ${r.status}`), { status: r.status });
        const data = await r.json();
        if (!data || !data.response) throw new Error('Respuesta vacía del proveedor');
        return { texto: data.response, sessionId: data.session_id || sessionId };
    } finally {
        clearTimeout(timer);
    }
}

// Comprobación ligera de disponibilidad (cacheada)
let cacheEstado = null;
async function comprobarProveedor(cfg, forzar) {
    if (!forzar && cacheEstado && Date.now() - cacheEstado.en < ESTADO_TTL_MS) return cacheEstado;
    let disponible = false;
    let detalle = '';
    if (!cfg.activo) {
        detalle = 'Asistente desactivado';
    } else if (fallaAutenticacion) {
        detalle = 'El proveedor rechazó la API key: actualízala con PUT /api/chatbot/config';
    } else if (!cfg.url) {
        detalle = 'Proveedor sin configurar';
    } else {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
            const ruta = cfg.modo === 'openai' ? '/v1/models' : '/health';
            const headers = cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {};
            const r = await fetch(cfg.url + ruta, { headers, signal: controller.signal });
            disponible = r.ok;
            detalle = r.ok ? 'En línea' : `El proveedor respondió ${r.status}`;
        } catch (e) {
            detalle = e.name === 'AbortError' ? 'El proveedor no respondió a tiempo' : 'No se pudo contactar al proveedor';
        } finally {
            clearTimeout(timer);
        }
    }
    cacheEstado = { disponible, detalle, en: Date.now() };
    return cacheEstado;
}

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

// Límite propio del chat: protege la GPU / cuota del proveedor
const limiteChat = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Has enviado muchos mensajes seguidos. Espera unos minutos, o escríbenos por WhatsApp.' }
});

// GET /api/chatbot/estado -> { disponible } para el indicador del widget
router.get('/estado', async (req, res) => {
    const cfg = await obtenerConfig();
    const estado = await comprobarProveedor(cfg);
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, disponible: estado.disponible });
});

// POST /api/chatbot -> respuesta verificada contra el catálogo
router.post('/', limiteChat, async (req, res) => {
    const { message, session_id } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Debes enviar un mensaje.' });
    }
    const mensaje = message.trim().slice(0, MAX_MENSAJE);
    const sessionId = typeof session_id === 'string' ? session_id.slice(0, 80) : undefined;

    const cfg = await obtenerConfig();
    if (!cfg.activo || !cfg.url) {
        return res.status(503).json({ success: false, disponible: false, message: 'El asistente no está disponible en este momento.' });
    }

    try {
        const { texto, sessionId: sid } = await llamarProveedor(cfg, mensaje, sessionId);
        const catalogo = await obtenerCatalogo();
        const verificado = verificarRespuesta(texto, catalogo);
        if (verificado.eliminados.length) {
            console.warn('[chatbot] Productos inexistentes eliminados de la respuesta:', verificado.eliminados.join(', '));
        }
        cacheEstado = { disponible: true, detalle: 'En línea', en: Date.now() };
        fallaAutenticacion = false;
        res.json({
            success: true,
            session_id: sid,
            response: verificado.texto,
            productos: verificado.productos.map(({ clave, ...p }) => p)
        });
    } catch (err) {
        cacheEstado = { disponible: false, detalle: err.message, en: Date.now() };
        if (err.status === 401 || err.status === 403) {
            fallaAutenticacion = true;
            cacheEstado = { disponible: false, detalle: 'El proveedor rechazó la API key', en: Date.now() };
            console.error('[chatbot] El proveedor rechazó la API key. Actualízala con PUT /api/chatbot/config');
        } else {
            console.error('[chatbot] Error del proveedor:', err.name === 'AbortError' ? 'timeout' : err.message);
        }
        res.status(err.name === 'AbortError' ? 504 : 502).json({
            success: false,
            disponible: false,
            message: 'El asistente no está disponible en este momento.'
        });
    }
});

// ============================================================
// RUTAS DE ADMINISTRACIÓN (JWT de admin o cabecera x-admin-key)
// ============================================================

function vistaConfig(cfg, estado) {
    return {
        url: cfg.url || null,
        modo: cfg.modo,
        modelo: cfg.modelo || null,
        activo: cfg.activo,
        api_key: enmascarar(cfg.apiKey),
        origen: cfg.origen,
        actualizado_en: cfg.actualizadoEn,
        actualizado_por: cfg.actualizadoPor,
        estado: estado ? { disponible: estado.disponible, detalle: estado.detalle } : undefined
    };
}

// GET /api/chatbot/config -> configuración actual (key enmascarada) + prueba de conexión
router.get('/config', requireAdmin, async (req, res) => {
    const cfg = await obtenerConfig(true);
    const estado = await comprobarProveedor(cfg, true);
    res.json({ success: true, config: vistaConfig(cfg, estado) });
});

// PUT /api/chatbot/config -> cambia proveedor sin redesplegar
// Body (todo opcional): { url, api_key, modo: "nativo"|"openai", modelo, activo }
router.put('/config', requireAdmin, async (req, res) => {
    const { url, api_key, modo, modelo, activo } = req.body || {};
    const cambios = {};

    if (url !== undefined) {
        const limpia = String(url).trim().replace(/\/+$/, '').replace(/\/chat$/, '');
        let valida = false;
        try {
            const u = new URL(limpia);
            valida = u.protocol === 'https:' || (u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname));
        } catch (e) { valida = false; }
        if (!valida) return res.status(400).json({ success: false, message: 'La URL debe ser https:// (http solo para localhost).' });
        cambios.url = limpia;
    }
    if (api_key !== undefined) {
        if (typeof api_key !== 'string' || api_key.trim().length < 8) {
            return res.status(400).json({ success: false, message: 'La API key parece inválida.' });
        }
        try {
            cambios.api_key_cifrada = cifrar(api_key.trim());
        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }
    if (modo !== undefined) {
        if (!MODOS.includes(modo)) return res.status(400).json({ success: false, message: 'modo debe ser "nativo" u "openai".' });
        cambios.modo = modo;
    }
    if (modelo !== undefined) cambios.modelo = String(modelo).slice(0, 120) || null;
    if (activo !== undefined) cambios.activo = activo ? 1 : 0;

    if (!Object.keys(cambios).length) {
        return res.status(400).json({ success: false, message: 'No enviaste ningún cambio.' });
    }

    try {
        const pool = await getConnection();
        await asegurarTabla(pool);
        const actual = await obtenerConfig(true);
        const fila = {
            url: actual.url || null,
            api_key_cifrada: null,
            modo: actual.modo,
            modelo: actual.modelo || null,
            activo: actual.activo ? 1 : 0,
            ...cambios
        };
        // Conservar la key ya guardada si no se envió una nueva
        if (!cambios.api_key_cifrada) {
            const [rows] = await pool.query('SELECT api_key_cifrada FROM ConfigChatbot WHERE id = 1');
            fila.api_key_cifrada = rows.length ? rows[0].api_key_cifrada : null;
        }
        const autor = (req.user && (req.user.email || req.user.nombre || req.user.via)) || 'admin';
        await pool.query(
            `INSERT INTO ConfigChatbot (id, url, api_key_cifrada, modo, modelo, activo, actualizado_en, actualizado_por)
             VALUES (1, ?, ?, ?, ?, ?, NOW(), ?)
             ON DUPLICATE KEY UPDATE url = VALUES(url), api_key_cifrada = VALUES(api_key_cifrada), modo = VALUES(modo),
               modelo = VALUES(modelo), activo = VALUES(activo), actualizado_en = NOW(), actualizado_por = VALUES(actualizado_por)`,
            [fila.url, fila.api_key_cifrada, fila.modo, fila.modelo, fila.activo, String(autor).slice(0, 120)]
        );
        invalidarCaches();
        const cfg = await obtenerConfig(true);
        const estado = await comprobarProveedor(cfg, true);
        console.log(`[chatbot] Configuración actualizada por ${autor}: ${cfg.modo} ${cfg.url} (${estado.detalle})`);
        res.json({ success: true, config: vistaConfig(cfg, estado) });
    } catch (e) {
        console.error('[chatbot] Error guardando configuración:', e.message);
        res.status(500).json({ success: false, message: 'No se pudo guardar la configuración.' });
    }
});

module.exports = router;
module.exports.verificarRespuesta = verificarRespuesta; // pruebas

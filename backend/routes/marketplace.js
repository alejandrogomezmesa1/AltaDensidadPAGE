// Marca → Marketplace: seguimiento de lo publicado en Facebook Marketplace, textos editados por
// perfume, ajustes comunes y los informes de la vigía de tendencias. Todo es del panel (staff);
// investigar a pedido también es de staff, con un intervalo mínimo para no saturar las fuentes.
const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireStaff } = require('../middleware/auth');
const vigia = require('../services/vigia');
const { obtenerConfig } = require('./chatbot');

const ACCIONES = ['publicar', 'renovar', 'pausar', 'quitar'];
const AJUSTES = {
    pie: { defecto: '📦 Envíos a toda Colombia · también puedes recogerlo en Medellín\n💳 Paga por Nequi, Daviplata o transferencia\n💬 Escríbeme y te ayudo a elegir tu fragancia 👇', max: 600 },
    por_dia: { defecto: '5', entero: [1, 30] },
    renovar_dias: { defecto: '7', entero: [1, 30] }
};
const CAMPOS_TEXTO = { nombre: 80, gancho: 160, sensacion: 200, ideal: 160 };
const ESPERA_MANUAL_MS = 10 * 60 * 1000;

const fallo = (res, err, msg) => {
    console.error('[marketplace]', msg, err.message);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : msg });
};

async function autor(pool, user) {
    if (!user || !user.id) return user && user.via === 'admin-key' ? 'Sistema' : null;
    const [r] = await pool.query('SELECT nombre FROM Usuarios WHERE id = ?', [user.id]);
    return r[0]?.nombre || user.email || null;
}

const idValido = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// GET /api/admin/marketplace — publicaciones, textos editados y ajustes
router.get('/', requireStaff, async (req, res) => {
    try {
        const pool = await getConnection();
        const [pubs] = await pool.query(`SELECT producto_id AS id, estado, publicada_en AS publicadaEn, renovada_en AS renovadaEn,
            veces, enlace, actualizado_por AS actualizadoPor FROM MarketplacePublicaciones`);
        const [textos] = await pool.query('SELECT producto_id AS id, nombre, gancho, sensacion, ideal, actualizado_por AS actualizadoPor, actualizado_en AS actualizadoEn FROM MarketplaceTextos');
        const [ajustes] = await pool.query('SELECT clave, valor FROM MarketplaceAjustes');
        const guardados = Object.fromEntries(ajustes.map((a) => [a.clave, a.valor]));
        res.json({
            success: true,
            data: {
                publicaciones: Object.fromEntries(pubs.map((p) => [p.id, p])),
                textos: Object.fromEntries(textos.map((t) => [t.id, t])),
                ajustes: {
                    pie: guardados.pie ?? AJUSTES.pie.defecto,
                    porDia: Number(guardados.por_dia ?? AJUSTES.por_dia.defecto),
                    renovarDias: Number(guardados.renovar_dias ?? AJUSTES.renovar_dias.defecto)
                }
            }
        });
    } catch (err) {
        fallo(res, err, 'No se pudo leer el estado de Marketplace');
    }
});

// PUT /api/admin/marketplace/publicaciones/:id — { accion: publicar | renovar | pausar | quitar, enlace? }
router.put('/publicaciones/:id', requireStaff, async (req, res) => {
    const id = idValido(req.params.id);
    const { accion } = req.body || {};
    const enlace = String((req.body || {}).enlace || '').trim();
    if (!id) return res.status(400).json({ success: false, message: 'Perfume no válido' });
    if (!ACCIONES.includes(accion)) return res.status(400).json({ success: false, message: 'Acción no válida' });
    if (enlace && (enlace.length > 500 || !/^https:\/\/([a-z0-9-]+\.)*facebook\.com\//i.test(enlace))) {
        return res.status(400).json({ success: false, message: 'El enlace debe ser de facebook.com' });
    }
    try {
        const pool = await getConnection();
        const [prod] = await pool.query('SELECT id FROM Productos WHERE id = ?', [id]);
        if (!prod.length) return res.status(404).json({ success: false, message: 'Ese perfume no existe' });
        const quien = await autor(pool, req.user);
        if (accion === 'quitar') {
            await pool.query('DELETE FROM MarketplacePublicaciones WHERE producto_id = ?', [id]);
        } else if (accion === 'publicar') {
            await pool.query(`INSERT INTO MarketplacePublicaciones (producto_id, estado, publicada_en, veces, enlace, actualizado_por)
                VALUES (?, 'publicada', NOW(), 1, ?, ?)
                ON DUPLICATE KEY UPDATE estado = 'publicada', publicada_en = NOW(), renovada_en = NULL, veces = veces + 1,
                    enlace = COALESCE(VALUES(enlace), enlace), actualizado_por = VALUES(actualizado_por)`, [id, enlace || null, quien]);
        } else {
            const [r] = await pool.query(accion === 'renovar'
                ? `UPDATE MarketplacePublicaciones SET estado = 'publicada', renovada_en = NOW(), enlace = COALESCE(?, enlace), actualizado_por = ? WHERE producto_id = ?`
                : `UPDATE MarketplacePublicaciones SET estado = 'pausada', enlace = COALESCE(?, enlace), actualizado_por = ? WHERE producto_id = ?`,
            [enlace || null, quien, id]);
            if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Ese perfume no está publicado' });
        }
        const [fila] = await pool.query(`SELECT producto_id AS id, estado, publicada_en AS publicadaEn, renovada_en AS renovadaEn, veces, enlace,
            actualizado_por AS actualizadoPor FROM MarketplacePublicaciones WHERE producto_id = ?`, [id]);
        res.json({ success: true, data: fila[0] || null });
    } catch (err) {
        fallo(res, err, 'No se pudo guardar la publicación');
    }
});

// PUT /api/admin/marketplace/textos/:id — { nombre, gancho, sensacion, ideal }
router.put('/textos/:id', requireStaff, async (req, res) => {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Perfume no válido' });
    const datos = {};
    for (const [campo, max] of Object.entries(CAMPOS_TEXTO)) {
        const v = String((req.body || {})[campo] || '').replace(/\s+/g, ' ').trim();
        if (!v || v.length > max) return res.status(400).json({ success: false, message: `«${campo}» debe tener entre 1 y ${max} caracteres` });
        datos[campo] = v;
    }
    try {
        const pool = await getConnection();
        const [prod] = await pool.query('SELECT id FROM Productos WHERE id = ?', [id]);
        if (!prod.length) return res.status(404).json({ success: false, message: 'Ese perfume no existe' });
        const quien = await autor(pool, req.user);
        await pool.query(`INSERT INTO MarketplaceTextos (producto_id, nombre, gancho, sensacion, ideal, actualizado_por) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), gancho = VALUES(gancho), sensacion = VALUES(sensacion), ideal = VALUES(ideal),
                actualizado_por = VALUES(actualizado_por)`, [id, datos.nombre, datos.gancho, datos.sensacion, datos.ideal, quien]);
        res.json({ success: true, data: { id, ...datos, actualizadoPor: quien } });
    } catch (err) {
        fallo(res, err, 'No se pudo guardar el texto');
    }
});

// DELETE /api/admin/marketplace/textos/:id — vuelve al texto base
router.delete('/textos/:id', requireStaff, async (req, res) => {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Perfume no válido' });
    try {
        const pool = await getConnection();
        await pool.query('DELETE FROM MarketplaceTextos WHERE producto_id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        fallo(res, err, 'No se pudo restablecer el texto');
    }
});

// PUT /api/admin/marketplace/ajustes — { pie?, porDia?, renovarDias? }
router.put('/ajustes', requireStaff, async (req, res) => {
    const entrada = { pie: req.body?.pie, por_dia: req.body?.porDia, renovar_dias: req.body?.renovarDias };
    const cambios = [];
    for (const [clave, valor] of Object.entries(entrada)) {
        if (valor === undefined) continue;
        const def = AJUSTES[clave];
        if (def.entero) {
            const n = Number(valor);
            if (!Number.isInteger(n) || n < def.entero[0] || n > def.entero[1]) {
                return res.status(400).json({ success: false, message: `El valor debe estar entre ${def.entero[0]} y ${def.entero[1]}` });
            }
            cambios.push([clave, String(n)]);
        } else {
            const t = String(valor).trim();
            if (!t || t.length > def.max) return res.status(400).json({ success: false, message: `El texto debe tener entre 1 y ${def.max} caracteres` });
            cambios.push([clave, t]);
        }
    }
    if (!cambios.length) return res.status(400).json({ success: false, message: 'Nada que guardar' });
    try {
        const pool = await getConnection();
        for (const [clave, valor] of cambios) {
            await pool.query('INSERT INTO MarketplaceAjustes (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)', [clave, valor]);
        }
        res.json({ success: true });
    } catch (err) {
        fallo(res, err, 'No se pudieron guardar los ajustes');
    }
});

// GET /api/admin/marketplace/tendencias — último informe (o ?id=) y la lista de informes recientes
router.get('/tendencias', requireStaff, async (req, res) => {
    try {
        const pool = await getConnection();
        const id = idValido(req.query.id);
        const [filas] = await pool.query(`SELECT id, generado_en AS generadoEn, origen, datos, resumen, resumen_origen AS resumenOrigen
            FROM TendenciasInformes ${id ? 'WHERE id = ?' : 'ORDER BY id DESC LIMIT 1'}`, id ? [id] : []);
        const [historial] = await pool.query('SELECT id, generado_en AS generadoEn, origen FROM TendenciasInformes ORDER BY id DESC LIMIT 30');
        const informe = filas[0] ? { ...filas[0], datos: JSON.parse(filas[0].datos) } : null;
        res.json({ success: true, data: { informe, historial } });
    } catch (err) {
        fallo(res, err, 'No se pudo leer el informe de tendencias');
    }
});

// POST /api/admin/marketplace/tendencias — investigar ahora (tarda ~20-40 s)
router.post('/tendencias', requireStaff, async (req, res) => {
    try {
        const pool = await getConnection();
        const [r] = await pool.query(`SELECT generado_en AS en FROM TendenciasInformes WHERE origen = 'manual' ORDER BY id DESC LIMIT 1`);
        const desde = r[0] ? Date.now() - new Date(r[0].en).getTime() : Infinity;
        if (desde < ESPERA_MANUAL_MS) {
            const min = Math.ceil((ESPERA_MANUAL_MS - desde) / 60000);
            return res.status(429).json({ success: false, message: `Acabas de investigar: espera ${min} min para no saturar las fuentes` });
        }
        const { id } = await vigia.generarInforme(pool, { origen: 'manual', obtenerConfig });
        res.json({ success: true, data: { id } });
    } catch (err) {
        fallo(res, err, 'No se pudo completar la investigación');
    }
});

module.exports = router;

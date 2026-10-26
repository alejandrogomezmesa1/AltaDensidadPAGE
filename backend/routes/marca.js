// Pestaña Marca del panel: estado de revisión (propuesta → en revisión → aprobada / descartada),
// favoritas y notas por pieza del brand book. Leer y comentar: staff. Cambiar el estado: admin.
const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireStaff, requireAdmin } = require('../middleware/auth');

const ESTADOS = ['propuesta', 'revision', 'aprobada', 'descartada'];
const TIPOS = ['nota', 'cambio'];
const ETIQUETA = { propuesta: 'Propuesta', revision: 'En revisión', aprobada: 'Aprobada', descartada: 'Descartada' };
// «01_logo/03-imagotipo.svg»: carpeta y archivo del manifest, nada más
const PIEZA = /^[0-9a-z_]{1,60}\/[0-9a-z_.-]{1,90}\.svg$/i;

const piezaValida = (p) => typeof p === 'string' && PIEZA.test(p);
const fallo = (res, err, msg) => {
    console.error('[marca]', msg, err.message);
    res.status(500).json({ success: false, message: msg });
};

// Nombre visible de quien escribe (el token solo trae id, email y rol)
async function autor(pool, user) {
    if (!user || !user.id) return user && user.via === 'admin-key' ? 'Sistema' : null;
    const [r] = await pool.query('SELECT nombre FROM Usuarios WHERE id = ?', [user.id]);
    return r[0]?.nombre || user.email || null;
}

// GET /api/admin/marca — estado de todas las piezas y conteo de notas
router.get('/', requireStaff, async (req, res) => {
    try {
        const pool = await getConnection();
        const [piezas] = await pool.query('SELECT pieza, estado, favorita, actualizado_por, actualizado_en FROM MarcaPiezas');
        const [notas] = await pool.query(
            `SELECT pieza, SUM(tipo <> 'estado') AS notas, SUM(tipo = 'cambio' AND resuelta = 0) AS pendientes
             FROM MarcaNotas GROUP BY pieza`);
        const data = {};
        for (const p of piezas) {
            data[p.pieza] = { estado: p.estado, favorita: Boolean(p.favorita), actualizadoPor: p.actualizado_por, actualizadoEn: p.actualizado_en, notas: 0, pendientes: 0 };
        }
        for (const n of notas) {
            data[n.pieza] = { ...(data[n.pieza] || { estado: 'propuesta', favorita: false }), notas: Number(n.notas) || 0, pendientes: Number(n.pendientes) || 0 };
        }
        res.json({ success: true, data });
    } catch (err) {
        fallo(res, err, 'No se pudo leer el estado de la marca');
    }
});

// GET /api/admin/marca/notas?pieza=… — hilo de una pieza; sin pieza: actividad reciente
// ?pendientes=1 — todos los pedidos de cambio sin resolver
router.get('/notas', requireStaff, async (req, res) => {
    try {
        const pool = await getConnection();
        const campos = 'id, pieza, tipo, texto, resuelta, autor, usuario_id AS usuarioId, fecha';
        let filas;
        if (req.query.pieza) {
            if (!piezaValida(req.query.pieza)) return res.status(400).json({ success: false, message: 'Pieza no válida' });
            [filas] = await pool.query(`SELECT ${campos} FROM MarcaNotas WHERE pieza = ? ORDER BY fecha ASC, id ASC`, [req.query.pieza]);
        } else if (req.query.pendientes) {
            [filas] = await pool.query(`SELECT ${campos} FROM MarcaNotas WHERE tipo = 'cambio' AND resuelta = 0 ORDER BY pieza, fecha`);
        } else {
            const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 40, 1), 200);
            [filas] = await pool.query(`SELECT ${campos} FROM MarcaNotas ORDER BY fecha DESC, id DESC LIMIT ?`, [limite]);
        }
        res.json({ success: true, data: filas.map((f) => ({ ...f, resuelta: Boolean(f.resuelta) })) });
    } catch (err) {
        fallo(res, err, 'No se pudieron leer las notas');
    }
});

// POST /api/admin/marca/notas — { pieza, texto, tipo: 'nota' | 'cambio' }
router.post('/notas', requireStaff, async (req, res) => {
    const { pieza, tipo = 'nota' } = req.body || {};
    const texto = String((req.body || {}).texto || '').trim();
    if (!piezaValida(pieza)) return res.status(400).json({ success: false, message: 'Pieza no válida' });
    if (!TIPOS.includes(tipo)) return res.status(400).json({ success: false, message: 'Tipo de nota no válido' });
    if (!texto || texto.length > 2000) return res.status(400).json({ success: false, message: 'La nota debe tener entre 1 y 2000 caracteres' });
    try {
        const pool = await getConnection();
        const nombre = await autor(pool, req.user);
        const [r] = await pool.query('INSERT INTO MarcaNotas (pieza, tipo, texto, usuario_id, autor) VALUES (?, ?, ?, ?, ?)',
            [pieza, tipo, texto, req.user?.id || null, nombre]);
        const [filas] = await pool.query('SELECT id, pieza, tipo, texto, resuelta, autor, usuario_id AS usuarioId, fecha FROM MarcaNotas WHERE id = ?', [r.insertId]);
        res.status(201).json({ success: true, data: { ...filas[0], resuelta: false } });
    } catch (err) {
        fallo(res, err, 'No se pudo guardar la nota');
    }
});

// PATCH /api/admin/marca/notas/:id — { resuelta } (marcar un pedido de cambio como hecho)
router.patch('/notas/:id', requireStaff, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: 'Nota no válida' });
    try {
        const pool = await getConnection();
        const [r] = await pool.query("UPDATE MarcaNotas SET resuelta = ? WHERE id = ? AND tipo = 'cambio'", [req.body?.resuelta ? 1 : 0, id]);
        if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Pedido de cambio no encontrado' });
        res.json({ success: true });
    } catch (err) {
        fallo(res, err, 'No se pudo actualizar la nota');
    }
});

// DELETE /api/admin/marca/notas/:id — su autor o un admin; los registros de estado no se borran
router.delete('/notas/:id', requireStaff, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: 'Nota no válida' });
    try {
        const pool = await getConnection();
        const [filas] = await pool.query('SELECT usuario_id, tipo FROM MarcaNotas WHERE id = ?', [id]);
        if (!filas.length || filas[0].tipo === 'estado') return res.status(404).json({ success: false, message: 'Nota no encontrada' });
        const esAdmin = ['admin', 'superadmin', 'root'].includes(String(req.user?.rol || '').toLowerCase());
        if (!esAdmin && filas[0].usuario_id !== req.user?.id) return res.status(403).json({ success: false, message: 'Solo quien la escribió puede borrarla' });
        await pool.query('DELETE FROM MarcaNotas WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        fallo(res, err, 'No se pudo borrar la nota');
    }
});

// PUT /api/admin/marca/piezas — { pieza, estado?, favorita? }; el cambio de estado queda en el hilo
router.put('/piezas', requireAdmin, async (req, res) => {
    const { pieza, estado, favorita } = req.body || {};
    if (!piezaValida(pieza)) return res.status(400).json({ success: false, message: 'Pieza no válida' });
    if (estado !== undefined && !ESTADOS.includes(estado)) return res.status(400).json({ success: false, message: 'Estado no válido' });
    try {
        const pool = await getConnection();
        const nombre = await autor(pool, req.user);
        const [antes] = await pool.query('SELECT estado, favorita FROM MarcaPiezas WHERE pieza = ?', [pieza]);
        const previo = antes[0] || { estado: 'propuesta', favorita: 0 };
        const nuevoEstado = estado ?? previo.estado;
        const nuevaFav = favorita === undefined ? previo.favorita : (favorita ? 1 : 0);
        await pool.query(
            `INSERT INTO MarcaPiezas (pieza, estado, favorita, actualizado_por) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE estado = VALUES(estado), favorita = VALUES(favorita), actualizado_por = VALUES(actualizado_por)`,
            [pieza, nuevoEstado, nuevaFav, nombre]);
        if (nuevoEstado !== previo.estado) {
            await pool.query("INSERT INTO MarcaNotas (pieza, tipo, texto, usuario_id, autor) VALUES (?, 'estado', ?, ?, ?)",
                [pieza, `${ETIQUETA[previo.estado] || previo.estado} → ${ETIQUETA[nuevoEstado]}`, req.user?.id || null, nombre]);
        }
        res.json({ success: true, data: { estado: nuevoEstado, favorita: Boolean(nuevaFav), actualizadoPor: nombre } });
    } catch (err) {
        fallo(res, err, 'No se pudo actualizar la pieza');
    }
});

// ── Personalizables: plantillas guardadas (firma, etiquetas, tarjeta de agradecimiento, QR) ──
const TIPOS_PLANTILLA = ['firma', 'etiqueta_posterior', 'etiqueta_decant', 'agradecimiento', 'qr'];
const MAX_DATOS = 20000;

function leerPlantilla(body) {
    const { tipo, nombre, datos } = body || {};
    if (!TIPOS_PLANTILLA.includes(tipo)) return { error: 'Tipo de plantilla no válido' };
    const n = String(nombre || '').trim();
    if (!n || n.length > 120) return { error: 'El nombre debe tener entre 1 y 120 caracteres' };
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return { error: 'Faltan los datos de la plantilla' };
    const texto = JSON.stringify(datos);
    if (texto.length > MAX_DATOS) return { error: 'La plantilla es demasiado grande' };
    return { tipo, nombre: n, texto };
}

const filaPlantilla = (f) => {
    let datos = {};
    try { datos = JSON.parse(f.datos); } catch { /* datos dañados: se devuelven vacíos */ }
    return { id: f.id, tipo: f.tipo, nombre: f.nombre, datos, creadoPor: f.creado_por, actualizadoPor: f.actualizado_por, creadoEn: f.creado_en, actualizadoEn: f.actualizado_en };
};

// GET /api/admin/marca/plantillas?tipo=firma
router.get('/plantillas', requireStaff, async (req, res) => {
    const { tipo } = req.query;
    if (tipo && !TIPOS_PLANTILLA.includes(tipo)) return res.status(400).json({ success: false, message: 'Tipo de plantilla no válido' });
    try {
        const pool = await getConnection();
        const [filas] = tipo
            ? await pool.query('SELECT * FROM MarcaPlantillas WHERE tipo = ? ORDER BY nombre, id', [tipo])
            : await pool.query('SELECT * FROM MarcaPlantillas ORDER BY tipo, nombre, id');
        res.json({ success: true, data: filas.map(filaPlantilla) });
    } catch (err) {
        fallo(res, err, 'No se pudieron leer las plantillas');
    }
});

// POST /api/admin/marca/plantillas — { tipo, nombre, datos }
router.post('/plantillas', requireStaff, async (req, res) => {
    const p = leerPlantilla(req.body);
    if (p.error) return res.status(400).json({ success: false, message: p.error });
    try {
        const pool = await getConnection();
        const quien = await autor(pool, req.user);
        const [r] = await pool.query('INSERT INTO MarcaPlantillas (tipo, nombre, datos, creado_por, actualizado_por) VALUES (?, ?, ?, ?, ?)',
            [p.tipo, p.nombre, p.texto, quien, quien]);
        const [filas] = await pool.query('SELECT * FROM MarcaPlantillas WHERE id = ?', [r.insertId]);
        res.status(201).json({ success: true, data: filaPlantilla(filas[0]) });
    } catch (err) {
        fallo(res, err, 'No se pudo guardar la plantilla');
    }
});

// PUT /api/admin/marca/plantillas/:id — { tipo, nombre, datos } (el tipo no cambia)
router.put('/plantillas/:id', requireStaff, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: 'Plantilla no válida' });
    const p = leerPlantilla(req.body);
    if (p.error) return res.status(400).json({ success: false, message: p.error });
    try {
        const pool = await getConnection();
        const quien = await autor(pool, req.user);
        const [r] = await pool.query('UPDATE MarcaPlantillas SET nombre = ?, datos = ?, actualizado_por = ? WHERE id = ? AND tipo = ?',
            [p.nombre, p.texto, quien, id, p.tipo]);
        if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        const [filas] = await pool.query('SELECT * FROM MarcaPlantillas WHERE id = ?', [id]);
        res.json({ success: true, data: filaPlantilla(filas[0]) });
    } catch (err) {
        fallo(res, err, 'No se pudo actualizar la plantilla');
    }
});

// DELETE /api/admin/marca/plantillas/:id
router.delete('/plantillas/:id', requireStaff, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: 'Plantilla no válida' });
    try {
        const pool = await getConnection();
        const [r] = await pool.query('DELETE FROM MarcaPlantillas WHERE id = ?', [id]);
        if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        res.json({ success: true });
    } catch (err) {
        fallo(res, err, 'No se pudo borrar la plantilla');
    }
});

module.exports = router;

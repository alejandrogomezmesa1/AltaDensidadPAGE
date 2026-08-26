const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/induccion/mi-progreso
router.get('/mi-progreso', requireAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        const userId = req.user.id;

        const [userRows] = await pool.query(
            'SELECT id, nombre, email, rol, estado_induccion, intentos_examen, ultimo_puntaje FROM Usuarios WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const usuario = userRows[0];

        const [itemsTotal] = await pool.query('SELECT COUNT(*) as total FROM CapacitacionItems WHERE activo = 1');
        const totalItems = itemsTotal[0].total;

        const [progresoRows] = await pool.query(
            'SELECT item_id FROM UsuarioProgresoInduccion WHERE usuario_id = ? AND completado = 1',
            [userId]
        );
        const itemsCompletados = progresoRows.map(r => r.item_id);

        res.json({
            success: true,
            data: {
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    estado_induccion: usuario.estado_induccion || 'pendiente_capacitacion',
                    intentos_examen: usuario.intentos_examen || 0,
                    ultimo_puntaje: usuario.ultimo_puntaje || 0
                },
                totalItems,
                itemsCompletados
            }
        });
    } catch (err) {
        console.error('Error en mi-progreso:', err);
        res.status(500).json({ success: false, message: 'Error al obtener progreso de inducción' });
    }
});

// GET /api/induccion/items
router.get('/items', requireAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        const [items] = await pool.query(
            'SELECT id, titulo, contenido, orden FROM CapacitacionItems WHERE activo = 1 ORDER BY orden ASC'
        );

        for (let item of items) {
            const [preguntas] = await pool.query(
                'SELECT id, pregunta, opciones, orden FROM CapacitacionPreguntas WHERE item_id = ? ORDER BY orden ASC',
                [item.id]
            );
            item.preguntas = preguntas.map(p => {
                let opts = p.opciones;
                if (typeof opts === 'string') {
                    try { opts = JSON.parse(opts); } catch (e) { opts = []; }
                }
                return {
                    id: p.id,
                    pregunta: p.pregunta,
                    opciones: opts,
                    orden: p.orden
                };
            });
        }

        res.json({ success: true, data: items });
    } catch (err) {
        console.error('Error al obtener items de capacitación:', err);
        res.status(500).json({ success: false, message: 'Error al cargar contenido de capacitación' });
    }
});

// POST /api/induccion/validar-item
router.post('/validar-item', requireAuth, async (req, res) => {
    try {
        const { item_id, respuestas } = req.body;
        if (!item_id || !respuestas) {
            return res.status(400).json({ success: false, message: 'Faltan respuestas o ID de módulo' });
        }

        const pool = await getConnection();
        const [preguntas] = await pool.query(
            'SELECT id, respuesta_correcta FROM CapacitacionPreguntas WHERE item_id = ?',
            [item_id]
        );

        if (preguntas.length === 0) {
            return res.status(400).json({ success: false, message: 'El módulo no tiene preguntas asociadas' });
        }

        let todasCorrectas = true;
        for (let p of preguntas) {
            const respuestaUsuario = parseInt(respuestas[p.id], 10);
            if (isNaN(respuestaUsuario) || respuestaUsuario !== p.respuesta_correcta) {
                todasCorrectas = false;
                break;
            }
        }

        if (!todasCorrectas) {
            return res.json({
                success: false,
                completado: false,
                message: 'No todas las respuestas fueron correctas. Revisa el contenido e inténtalo de nuevo.'
            });
        }

        // Registrar progreso
        await pool.query(
            `INSERT INTO UsuarioProgresoInduccion (usuario_id, item_id, completado, fecha_completado)
             VALUES (?, ?, 1, NOW())
             ON DUPLICATE KEY UPDATE completado = 1, fecha_completado = NOW()`,
            [req.user.id, item_id]
        );

        res.json({
            success: true,
            completado: true,
            message: '¡Excelente! Has respondido correctamente todas las preguntas de este módulo.'
        });
    } catch (err) {
        console.error('Error en validar-item:', err);
        res.status(500).json({ success: false, message: 'Error al validar el módulo' });
    }
});

// GET /api/induccion/examen
router.get('/examen', requireAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        // Verificar si existen preguntas de examen general (item_id IS NULL) o traer preguntas de los módulos
        let [preguntas] = await pool.query(
            'SELECT id, pregunta, opciones, orden FROM CapacitacionPreguntas ORDER BY RAND() LIMIT 10'
        );

        const preguntasExamen = preguntas.map(p => {
            let opts = p.opciones;
            if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch (e) { opts = []; }
            }
            return {
                id: p.id,
                pregunta: p.pregunta,
                opciones: opts
            };
        });

        res.json({ success: true, data: preguntasExamen });
    } catch (err) {
        console.error('Error al obtener examen:', err);
        res.status(500).json({ success: false, message: 'Error al cargar preguntas del examen' });
    }
});

// POST /api/induccion/evaluar-examen
router.post('/evaluar-examen', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { respuestas } = req.body;

        if (!respuestas || typeof respuestas !== 'object') {
            return res.status(400).json({ success: false, message: 'Se requieren las respuestas del examen' });
        }

        const pool = await getConnection();
        const [userRows] = await pool.query(
            'SELECT id, intentos_examen, estado_induccion FROM Usuarios WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const usuario = userRows[0];
        const intentosActuales = usuario.intentos_examen || 0;

        if (intentosActuales >= 3 && usuario.estado_induccion !== 'examen_aprobado' && usuario.estado_induccion !== 'autorizado') {
            return res.status(403).json({
                success: false,
                bloqueado: true,
                message: 'Has agotado tus 3 intentos disponibles. Por favor contacta al Administrador.'
            });
        }

        const nuevosIntentos = intentosActuales + 1;

        // Obtener preguntas respondidas
        const preguntaIds = Object.keys(respuestas);
        if (preguntaIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Debes responder todas las preguntas' });
        }

        const placeholders = preguntaIds.map(() => '?').join(',');
        const [preguntas] = await pool.query(
            `SELECT id, respuesta_correcta FROM CapacitacionPreguntas WHERE id IN (${placeholders})`,
            preguntaIds
        );

        let aciertos = 0;
        const total = preguntas.length;

        for (let p of preguntas) {
            const respUsuario = parseInt(respuestas[p.id], 10);
            if (!isNaN(respUsuario) && respUsuario === p.respuesta_correcta) {
                aciertos++;
            }
        }

        const puntajePercent = total > 0 ? Math.round((aciertos / total) * 100) : 0;
        const esAprobado = puntajePercent === 100;

        let nuevoEstado = usuario.estado_induccion;
        if (esAprobado) {
            nuevoEstado = 'examen_aprobado';
        } else if (nuevosIntentos >= 3) {
            nuevoEstado = 'bloqueado';
        }

        await pool.query(
            'UPDATE Usuarios SET intentos_examen = ?, ultimo_puntaje = ?, estado_induccion = ? WHERE id = ?',
            [nuevosIntentos, puntajePercent, nuevoEstado, userId]
        );

        if (esAprobado) {
            return res.json({
                success: true,
                aprobado: true,
                puntaje: puntajePercent,
                intentos: nuevosIntentos,
                message: '¡Felicitaciones! Has aprobado el examen de inducción con 100%. Tu estado ahora es Pendiente de Autorización. Informa a tu Administrador.'
            });
        } else {
            return res.json({
                success: false,
                aprobado: false,
                puntaje: puntajePercent,
                intentos: nuevosIntentos,
                bloqueado: nuevosIntentos >= 3,
                message: nuevosIntentos >= 3
                    ? 'Has agotado tus 3 intentos sin obtener 100%. Contacta a tu Administrador para solicitar revisión.'
                    : `Obtuviste ${puntajePercent}%. Debes responder el 100% correctamente para aprobar. Te quedan ${3 - nuevosIntentos} intento(s).`
            });
        }
    } catch (err) {
        console.error('Error al evaluar examen:', err);
        res.status(500).json({ success: false, message: 'Error al procesar la evaluación del examen' });
    }
});

module.exports = router;

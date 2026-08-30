const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

// GET /api/induccion/mi-progreso
router.get('/mi-progreso', optionalAuth, async (req, res) => {
    try {
        const pool = await getConnection();
        const [itemsTotal] = await pool.query('SELECT COUNT(*) as total FROM CapacitacionItems WHERE activo = 1');
        const totalItems = itemsTotal[0].total;

        if (!req.user || !req.user.id) {
            return res.json({
                success: true,
                data: {
                    usuario: {
                        id: 0,
                        nombre: "Visitante",
                        email: "",
                        rol: "invitado",
                        estado_induccion: "pendiente_capacitacion",
                        intentos_examen: 0,
                        ultimo_puntaje: 0
                    },
                    totalItems,
                    itemsCompletados: []
                }
            });
        }

        const userId = req.user.id;
        const [userRows] = await pool.query(
            'SELECT id, nombre, email, rol, estado_induccion, intentos_examen, ultimo_puntaje FROM Usuarios WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.json({
                success: true,
                data: {
                    usuario: {
                        id: 0,
                        nombre: "Visitante",
                        email: "",
                        rol: "invitado",
                        estado_induccion: "pendiente_capacitacion",
                        intentos_examen: 0,
                        ultimo_puntaje: 0
                    },
                    totalItems,
                    itemsCompletados: []
                }
            });
        }

        const usuario = userRows[0];
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

// GET /api/induccion/items (PÚBLICO)
router.get('/items', async (req, res) => {
    try {
        const pool = await getConnection();
        const [items] = await pool.query(
            'SELECT id, titulo, contenido, tipo, imagen_url, video_url, orden FROM CapacitacionItems WHERE activo = 1 ORDER BY orden ASC'
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
router.post('/validar-item', optionalAuth, async (req, res) => {
    try {
        const { item_id, respuestas } = req.body;
        if (!item_id) {
            return res.status(400).json({ success: false, message: 'Falta el ID del módulo' });
        }

        const pool = await getConnection();
        const [preguntas] = await pool.query(
            'SELECT id, respuesta_correcta FROM CapacitacionPreguntas WHERE item_id = ?',
            [item_id]
        );

        if (preguntas.length > 0) {
            if (!respuestas) {
                return res.status(400).json({ success: false, message: 'Faltan las respuestas del módulo' });
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
        }

        // Registrar progreso si hay usuario logueado
        if (req.user && req.user.id) {
            await pool.query(
                `INSERT INTO UsuarioProgresoInduccion (usuario_id, item_id, completado, fecha_completado)
                 VALUES (?, ?, 1, NOW())
                 ON DUPLICATE KEY UPDATE completado = 1, fecha_completado = NOW()`,
                [req.user.id, item_id]
            );
        }

        res.json({
            success: true,
            completado: true,
            message: preguntas.length > 0
                ? '¡Excelente! Has respondido correctamente todas las preguntas de este módulo.'
                : '¡Excelente! Módulo visto y completado exitosamente.'
        });
    } catch (err) {
        console.error('Error en validar-item:', err);
        res.status(500).json({ success: false, message: 'Error al validar el módulo' });
    }
});

// GET /api/induccion/examen (PÚBLICO)
router.get('/examen', async (req, res) => {
    try {
        const pool = await getConnection();
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
router.post('/evaluar-examen', optionalAuth, async (req, res) => {
    try {
        const { respuestas } = req.body;

        if (!respuestas || typeof respuestas !== 'object') {
            return res.status(400).json({ success: false, message: 'Se requieren las respuestas del examen' });
        }

        const pool = await getConnection();

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

        if (req.user && req.user.id) {
            const userId = req.user.id;
            const [userRows] = await pool.query(
                'SELECT id, intentos_examen, estado_induccion FROM Usuarios WHERE id = ?',
                [userId]
            );
            if (userRows.length > 0) {
                const usuario = userRows[0];
                const intentosActuales = usuario.intentos_examen || 0;
                const nuevosIntentos = intentosActuales + 1;
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
            }
        }

        if (esAprobado) {
            return res.json({
                success: true,
                aprobado: true,
                puntaje: puntajePercent,
                intentos: 1,
                message: '¡Felicitaciones! Has aprobado el examen de inducción con 100%. Has completado exitosamente la capacitación.'
            });
        } else {
            return res.json({
                success: false,
                aprobado: false,
                puntaje: puntajePercent,
                intentos: 1,
                bloqueado: false,
                message: `Obtuviste ${puntajePercent}%. Debes responder el 100% correctamente para aprobar. ¡Puedes volver a intentarlo cuando desees!`
            });
        }
    } catch (err) {
        console.error('Error al evaluar examen:', err);
        res.status(500).json({ success: false, message: 'Error al procesar la evaluación del examen' });
    }
});

module.exports = router;

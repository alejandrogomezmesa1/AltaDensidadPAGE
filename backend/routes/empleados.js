const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// POST /api/admin/empleados/registrar (Solo Admin)
router.post('/registrar', requireAdmin, async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const pool = await getConnection();
        const [existe] = await pool.query('SELECT id FROM Usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(409).json({ success: false, message: 'El email ya está registrado' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            `INSERT INTO Usuarios (nombre, email, password_hash, rol, estado_induccion, intentos_examen)
             VALUES (?, ?, ?, 'empleado', 'pendiente_capacitacion', 0)`,
            [nombre, email, password_hash]
        );

        // Generar enlace WhatsApp para envío manual fácil por el Admin
        let whatsapp_url = null;
        if (telefono) {
            const numLimpio = telefono.replace(/\D/g, '');
            const textoMensaje = `*¡Hola ${nombre}!* Bienvenido(a) al equipo de Perfumería Alta Densidad ✨.\n\n` +
                `Te hemos registrado como nuevo colaborador. Ingresa a tu panel en:\n` +
                `https://alta-densidad-page.vercel.app/login.html\n\n` +
                `*Tus credenciales:*\n` +
                `📧 *Email:* ${email}\n` +
                `🔑 *Contraseña:* ${password}\n\n` +
                `*Importante:* Al ingresar debes realizar la capacitación obligatoria y aprobar el examen final de inducción para habilitar tu acceso completo. ¡Muchos éxitos!`;
            
            whatsapp_url = `https://wa.me/${numLimpio}?text=${encodeURIComponent(textoMensaje)}`;
        }

        res.status(201).json({
            success: true,
            message: 'Empleado registrado exitosamente',
            data: {
                id: result.insertId,
                nombre,
                email,
                rol: 'empleado',
                estado_induccion: 'pendiente_capacitacion',
                whatsapp_url
            }
        });
    } catch (err) {
        console.error('Error al registrar empleado:', err);
        res.status(500).json({ success: false, message: 'Error al registrar colaborador' });
    }
});

// GET /api/admin/empleados (Solo Admin)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const pool = await getConnection();

        const [itemsTotalRow] = await pool.query('SELECT COUNT(*) as total FROM CapacitacionItems WHERE activo = 1');
        const totalItems = itemsTotalRow[0].total;

        const [rows] = await pool.query(`
            SELECT 
                u.id, u.nombre, u.email, u.rol, u.activo, u.estado_induccion, u.intentos_examen, u.ultimo_puntaje,
                u.fecha_autorizacion, u.creado_en,
                a.nombre as autorizador_nombre,
                (SELECT COUNT(*) FROM UsuarioProgresoInduccion up WHERE up.usuario_id = u.id AND up.completado = 1) as items_completados
            FROM Usuarios u
            LEFT JOIN Usuarios a ON u.autorizado_por = a.id
            WHERE u.rol = 'empleado'
            ORDER BY u.creado_en DESC
        `);

        const empleados = rows.map(e => ({
            ...e,
            totalItems,
            porcentajeLectura: totalItems > 0 ? Math.round((e.items_completados / totalItems) * 100) : 0
        }));

        res.json({ success: true, data: empleados });
    } catch (err) {
        console.error('Error al listar empleados:', err);
        res.status(500).json({ success: false, message: 'Error al consultar lista de empleados' });
    }
});

// POST /api/admin/empleados/autorizar (Solo Admin)
router.post('/autorizar', requireAdmin, async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) {
            return res.status(400).json({ success: false, message: 'El ID del empleado es requerido' });
        }

        const pool = await getConnection();
        const [emp] = await pool.query('SELECT id, nombre, estado_induccion FROM Usuarios WHERE id = ? AND rol = "empleado"', [usuario_id]);
        if (emp.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        const adminId = req.user && req.user.id ? req.user.id : null;

        await pool.query(
            `UPDATE Usuarios 
             SET estado_induccion = 'autorizado', autorizado_por = ?, fecha_autorizacion = NOW() 
             WHERE id = ?`,
            [adminId, usuario_id]
        );

        res.json({
            success: true,
            message: `Acceso del colaborador ${emp[0].nombre} autorizado exitosamente.`
        });
    } catch (err) {
        console.error('Error al autorizar empleado:', err);
        res.status(500).json({ success: false, message: 'Error al autorizar colaborador' });
    }
});

// POST /api/admin/empleados/reiniciar-intentos (Solo Admin)
router.post('/reiniciar-intentos', requireAdmin, async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) {
            return res.status(400).json({ success: false, message: 'El ID del empleado es requerido' });
        }

        const pool = await getConnection();
        await pool.query(
            `UPDATE Usuarios 
             SET intentos_examen = 0, ultimo_puntaje = 0, estado_induccion = 'pendiente_capacitacion' 
             WHERE id = ? AND rol = 'empleado'`,
            [usuario_id]
        );

        res.json({
            success: true,
            message: 'Intentos de examen y estado de inducción reiniciados correctamente.'
        });
    } catch (err) {
        console.error('Error al reiniciar intentos:', err);
        res.status(500).json({ success: false, message: 'Error al reiniciar intentos de examen' });
    }
});

module.exports = router;

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
            const textoMensaje = `*¡Hola ${nombre}!* ✨\n\n` +
                `Estas son tus credenciales de acceso para la *Inducción y Capacitación Obligatoria* de *Perfumería Alta Densidad*:\n\n` +
                `🌐 *Link de ingreso a la plataforma:*\n` +
                `https://alta-densidad-page.vercel.app/login.html\n\n` +
                `📧 *Correo registrado:* ${email}\n` +
                `🔑 *Contraseña temporal:* ${password}\n\n` +
                `📋 *¿Qué encontrarás al ingresar a la plataforma?*\n` +
                `1️⃣ *Breve Inducción Institucional:* Conocerás nuestra historia, misión, visión, reglamento interno, políticas de SST, EPP, plan de emergencia y comités (Brigada y COCOLA).\n` +
                `2️⃣ *Capacitación Operativa:* Aprenderás sobre nuestro portafolio de perfumería, atención al cliente, presentación personal y proceso de facturación en SIIGO.\n` +
                `3️⃣ *Evaluación Interactiva:* Cada uno de los 53 módulos cuenta con 3 preguntas de validación, seguidas del Examen Final Obligatorio para habilitar tu acceso definitivo.\n\n` +
                `¡Te deseamos muchos éxitos en tu proceso de aprendizaje! 🚀`;
            
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

// POST /api/admin/empleados/cambiar-password (Solo Admin)
router.post('/cambiar-password', requireAdmin, async (req, res) => {
    try {
        const { usuario_id, nueva_password } = req.body;
        if (!usuario_id || !nueva_password) {
            return res.status(400).json({ success: false, message: 'ID del empleado y nueva contraseña son requeridos' });
        }
        if (nueva_password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const pool = await getConnection();
        const [emp] = await pool.query('SELECT id, nombre FROM Usuarios WHERE id = ? AND rol = "empleado"', [usuario_id]);
        if (emp.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        const password_hash = await bcrypt.hash(nueva_password, 10);
        await pool.query('UPDATE Usuarios SET password_hash = ? WHERE id = ?', [password_hash, usuario_id]);

        res.json({
            success: true,
            message: `Contraseña de ${emp[0].nombre} actualizada correctamente.`
        });
    } catch (err) {
        console.error('Error al cambiar contraseña de empleado:', err);
        res.status(500).json({ success: false, message: 'Error al cambiar la contraseña del colaborador' });
    }
});

// PUT /api/admin/empleados/:id (Editar Datos del Empleado)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password } = req.body;

        if (!nombre || !email) {
            return res.status(400).json({ success: false, message: 'Nombre y email son requeridos' });
        }

        const pool = await getConnection();
        const [emp] = await pool.query('SELECT id FROM Usuarios WHERE id = ? AND rol = "empleado"', [id]);
        if (emp.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        const [dup] = await pool.query('SELECT id FROM Usuarios WHERE email = ? AND id != ?', [email, id]);
        if (dup.length > 0) {
            return res.status(409).json({ success: false, message: 'El email ya está registrado por otro usuario' });
        }

        if (password && password.trim().length >= 6) {
            const password_hash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE Usuarios SET nombre = ?, email = ?, password_hash = ? WHERE id = ?',
                [nombre, email, password_hash, id]
            );
        } else {
            await pool.query(
                'UPDATE Usuarios SET nombre = ?, email = ? WHERE id = ?',
                [nombre, email, id]
            );
        }

        res.json({
            success: true,
            message: 'Datos del colaborador actualizados correctamente.'
        });
    } catch (err) {
        console.error('Error al editar empleado:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar datos del colaborador' });
    }
});

// DELETE /api/admin/empleados/:id (Eliminar Empleado)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await getConnection();
        const [emp] = await pool.query('SELECT id, nombre FROM Usuarios WHERE id = ? AND rol = "empleado"', [id]);
        if (emp.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        try {
            await pool.query('DELETE FROM UsuarioProgresoInduccion WHERE usuario_id = ?', [id]);
        } catch (e) {}

        await pool.query('DELETE FROM Usuarios WHERE id = ?', [id]);

        res.json({
            success: true,
            message: `Colaborador ${emp[0].nombre} eliminado correctamente.`
        });
    } catch (err) {
        console.error('Error al eliminar empleado:', err);
        res.status(500).json({ success: false, message: 'Error al eliminar colaborador' });
    }
});

// PATCH /api/admin/empleados/:id/estado (Activar / Desactivar Empleado)
router.patch('/:id/estado', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        const pool = await getConnection();
        const [emp] = await pool.query('SELECT id, nombre FROM Usuarios WHERE id = ? AND rol = "empleado"', [id]);
        if (emp.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        const nuevoEstado = activo ? 1 : 0;
        await pool.query('UPDATE Usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id]);

        res.json({
            success: true,
            message: `Estado de ${emp[0].nombre} actualizado a ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}.`
        });
    } catch (err) {
        console.error('Error al cambiar estado de empleado:', err);
        res.status(500).json({ success: false, message: 'Error al cambiar estado del colaborador' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'altadensidad_secret';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nombre, email y contraseÃ±a son requeridos' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contraseÃ±a debe tener al menos 6 caracteres' });
        }

        const pool = await getConnection();
        const [existe] = await pool.query('SELECT id FROM Usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(409).json({ success: false, message: 'El email ya estÃ¡ registrado' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO Usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
            [nombre, email, password_hash]
        );

        const [rows] = await pool.query('SELECT id, nombre, email, rol FROM Usuarios WHERE id = ?', [result.insertId]);
        const usuario = rows[0];
        const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: { token, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error al registrar usuario', error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email y contraseÃ±a son requeridos' });
        }

        const pool = await getConnection();
        const [rows] = await pool.query(
            'SELECT id, nombre, email, password_hash, rol, activo FROM Usuarios WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }

        const usuario = rows[0];
        if (!usuario.activo) {
            return res.status(401).json({ success: false, message: 'Cuenta desactivada' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'Login exitoso',
            data: { token, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error al iniciar sesiÃ³n', error: error.message });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    try {
        const pool = await getConnection();
        const [users] = await pool.query('SELECT id, nombre FROM Usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            // Por seguridad, responde igual aunque no exista
            return res.json({ success: true, message: 'Si el email existe, se enviará un enlace de recuperación.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

        await pool.query(
            'UPDATE Usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
            [token, expires, email]
        );

        // Configura tu transport con SendGrid
        const transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey', // literal, no tu email
                pass: process.env.SENDGRID_API_KEY
            }
        });

        const resetUrl = `https://alta-densidad-page.vercel.app/reset?token=${token}&email=${encodeURIComponent(email)}`;
        await transporter.sendMail({
            from: 'Alta Densidad <no-reply@altadensidad.com>', // Puedes cambiarlo por el correo verificado en SendGrid
            to: email,
            subject: 'Recupera tu contraseña',
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>Este enlace expirará en 1 hora.</p>`
        });

        res.json({ success: true, message: 'Si el email existe, se enviará un enlace de recuperación.' });
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la solicitud', error: error.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    try {
        const pool = await getConnection();
        const [users] = await pool.query(
            'SELECT id, reset_token, reset_token_expires FROM Usuarios WHERE email = ?',
            [email]
        );
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Usuario no encontrado.' });
        }
        const user = users[0];
        if (!user.reset_token || user.reset_token !== token) {
            return res.status(400).json({ success: false, message: 'Token inválido.' });
        }
        if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ success: false, message: 'El token ha expirado.' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        await pool.query(
            'UPDATE Usuarios SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [password_hash, user.id]
        );
        res.json({ success: true, message: 'Contraseña restablecida correctamente.' });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({ success: false, message: 'Error al restablecer contraseña.', error: error.message });
    }
});

module.exports = router;

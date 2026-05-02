const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined. Authentication will fail.');
}

// El transportador de Nodemailer ha sido reemplazado por SendGrid para evitar bloqueos en Railway.

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
        res.status(500).json({ success: false, message: 'Error al registrar usuario' });
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
        res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
    }
});

// POST /api/auth/forgot-password (ahora envía un código numérico)
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'El email es requerido' });
        }

        const pool = await getConnection();
        const [rows] = await pool.query('SELECT id, nombre FROM Usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            // No revelamos si el email existe por seguridad
            return res.json({ success: true, message: 'Si el email existe, se enviar\u00e1 un c\u00f3digo de recuperaci\u00f3n.' });
        }

        const usuario = rows[0];
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = new Date(Date.now() + 3600000); // 1 hora

        await pool.query(
            'UPDATE Usuarios SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [codigo, expiracion, usuario.id]
        );

        // Enviar con SendGrid
        const msg = {
            to: email,
            from: 'perfumesaltadensidad@gmail.com', // CORREGIDO: perfumes en lugar de fragancias
            subject: 'C\u00f3digo de Recuperaci\u00f3n - Alta Densidad',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 15px; border: 1px solid #D4AF37; max-width: 600px; margin: auto;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #D4AF37; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Alta Densidad</h1>
                        <p style="color: #888; font-size: 14px;">Luxury Fragrance Experience</p>
                    </div>
                    <div style="background-color: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.2);">
                        <h2 style="color: #ffffff; margin-top: 0;">Recuperaci\u00f3n de Contrase\u00f1a</h2>
                        <p>Hola, <strong>${usuario.nombre}</strong>.</p>
                        <p>Has solicitado restablecer tu contrase\u00f1a. Utiliza el siguiente c\u00f3digo para continuar con el proceso:</p>
                        
                        <div style="background: #1a1a1a; color: #D4AF37; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; margin: 30px 0; border-radius: 8px; border: 1px solid #D4AF37; letter-spacing: 5px;">
                            ${codigo}
                        </div>
                        
                        <p style="font-size: 13px; color: #888;">Este c\u00f3digo es v\u00e1lido por 60 minutos. Si no has solicitado este cambio, puedes ignorar este mensaje.</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #555; font-size: 12px;">
                        <p>&copy; 2025 Alta Densidad | Medell\u00edn, Colombia</p>
                    </div>
                </div>
            `
        };

        await sgMail.send(msg);
        res.json({ success: true, message: 'Si el email existe, se enviar\u00e1 un c\u00f3digo de recuperaci\u00f3n.' });

    } catch (err) {
        console.error('Error en forgot-password (SendGrid):', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al enviar el código de recuperación. Por favor intenta más tarde.'
        });
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
        res.status(500).json({ success: false, message: 'Error al restablecer contraseña.' });
    }
});

module.exports = router;

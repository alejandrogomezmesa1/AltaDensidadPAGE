const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET not defined in environment variables.');
    // No detenemos el proceso inmediatamente pero fallará cualquier validación
}
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || null;

function extractBearer(tokenHeader) {
    if (!tokenHeader) return null;
    const parts = tokenHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    return null;
}

async function requireAuth(req, res, next) {
    try {
        const auth = req.headers['authorization'] || req.headers['Authorization'];
        const token = extractBearer(auth);
        if (!token) return res.status(401).json({ success: false, message: 'Token de autorización requerido' });
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        req.user = payload;
        return next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ success: false, message: 'Error en autenticación' });
    }
}

async function requireAdmin(req, res, next) {
    try {
        // Allow admin via static API key header
        const adminKey = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
        if (ADMIN_API_KEY && adminKey && adminKey === ADMIN_API_KEY) {
            req.user = { rol: 'admin', via: 'admin-key' };
            return next();
        }

        // Otherwise require JWT and role
        const auth = req.headers['authorization'] || req.headers['Authorization'];
        const token = extractBearer(auth);
        if (!token) return res.status(401).json({ success: false, message: 'Token de autorización requerido' });
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        const rol = String(payload.rol || '').toLowerCase();
        if (rol === 'admin' || rol === 'superadmin' || rol === 'root') {
            req.user = payload;
            return next();
        }
        return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    } catch (err) {
        console.error('Auth requireAdmin error:', err);
        return res.status(500).json({ success: false, message: 'Error en autorización' });
    }
}

async function requireStaff(req, res, next) {
    try {
        const adminKey = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
        if (ADMIN_API_KEY && adminKey && adminKey === ADMIN_API_KEY) {
            req.user = { rol: 'admin', via: 'admin-key' };
            return next();
        }

        const auth = req.headers['authorization'] || req.headers['Authorization'];
        const token = extractBearer(auth);
        if (!token) return res.status(401).json({ success: false, message: 'Token de autorización requerido' });
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        const rol = String(payload.rol || '').toLowerCase();
        if (rol === 'admin' || rol === 'superadmin' || rol === 'root') {
            req.user = payload;
            return next();
        }
        if (rol === 'empleado') {
            const { getConnection } = require('../config/db');
            const pool = await getConnection();
            const [rows] = await pool.query('SELECT estado_induccion FROM Usuarios WHERE id = ?', [payload.id]);
            if (rows.length > 0 && rows[0].estado_induccion === 'autorizado') {
                req.user = payload;
                return next();
            }
            return res.status(403).json({ success: false, message: 'Tu cuenta de empleado aún no ha sido autorizada por el Administrador.' });
        }
        return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    } catch (err) {
        console.error('Auth requireStaff error:', err);
        return res.status(500).json({ success: false, message: 'Error en autorización' });
    }
}

async function optionalAuth(req, res, next) {
    try {
        const auth = req.headers['authorization'] || req.headers['Authorization'];
        const token = extractBearer(auth);
        if (token && JWT_SECRET) {
            try {
                req.user = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                req.user = null;
            }
        } else {
            req.user = null;
        }
    } catch (err) {
        req.user = null;
    }
    next();
}

module.exports = { requireAuth, requireAdmin, requireStaff, optionalAuth };

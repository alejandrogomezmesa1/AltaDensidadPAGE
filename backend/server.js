const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { getConnection } = require('./config/db');
const productosRouter = require('./routes/productos');
const envasesRouter = require('./routes/envases');
const kitsRouter = require('./routes/kits');
const top10Router = require('./routes/top10');
const authRouter = require('./routes/auth');
const uploadRouter = require('./routes/upload');
const mercadopagoRouter = require('./routes/mercadopago');
const monitoreoRouter = require('./routes/monitoreo');
const chatbotRouter = require('./routes/chatbot');
const integracionRouter = require('./routes/integracion');
const catalogoRouter = require('./routes/catalogo');
const dataSync = require('./services/dataSync');
const { ejecutarMigraciones } = require('./migrator');
const esquema = require('./services/esquema');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. CORS - Debe ser de lo primero para que cualquier respuesta (incluyendo errores) tenga las cabeceras correctas
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        // Solo el sitio de la tienda y sus vistas previas de Vercel (alta-densidad-page-…vercel.app)
        const isVercel = /^https:\/\/alta-densidad-page(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);
        const allowedExplicit = [
            'https://alta-densidad-page.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (isLocalhost || isVercel || allowedExplicit.includes(origin)) {
            callback(null, true);
        } else {
            console.error('CORS blocked origin:', origin);
            callback(new Error('CORS no permitido para este origen'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    credentials: true
}));

// 2. Seguridad de Cabeceras con Helmet
app.use(helmet());

// 3. Rate Limiting - Evitar ataques de fuerza bruta y DoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // Aumentado a 500 para evitar bloqueos falsos durante pruebas intensas
    message: { success: false, message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Limitador más estricto para login y registro
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50,
    message: { success: false, message: 'Demasiados intentos de acceso. Intenta de nuevo en una hora.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Limitador anti-fuerza bruta para recuperación de contraseña
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos cada 15 minutos
    message: { success: false, message: 'Demasiados intentos de recuperación de contraseña. Por favor intenta más tarde.' }
});
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);

app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Capturar raw body para permitir verificación de firmas en webhooks
app.use(express.json({
    limit: '10kb', // Limitar el tamaño del body para evitar ataques de carga
    verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: true, limit: '10kb', verify: (req, res, buf) => { req.rawBody = buf; } }));

// 3. Sanitización básica contra XSS
const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            // Eliminar etiquetas HTML sospechosas
            obj[key] = obj[key].replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
                               .replace(/<[^>]+>/gm, '');
        } else if (typeof obj[key] === 'object') {
            sanitize(obj[key]);
        }
    }
    return obj;
};

app.use((req, res, next) => {
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
});

// Rutas API
app.use('/api/productos', productosRouter);
app.use('/api/envases', envasesRouter);
app.use('/api/kits', kitsRouter);
app.use('/api/catalogo', catalogoRouter);
app.use('/api/top10', top10Router);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/mercadopago', mercadopagoRouter);
app.use('/api/admin/monitoreo', monitoreoRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/admin/integracion', integracionRouter);

// Servir la plataforma independiente de capacitación como endpoint autónomo
app.use('/capacitacion', express.static(path.join(__dirname, '../plataforma-capacitacion')));
app.use('/induccion', express.static(path.join(__dirname, '../plataforma-capacitacion')));

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API Alta Densidad funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// Entorno local: iniciar servidor con listen
// En Vercel (serverless) se exporta directamente la app
if (process.env.VERCEL !== '1') {
    async function iniciarServidor() {
        try {
            const pool = await getConnection();
            // Migraciones versionadas del esquema (ver backend/migrations).
            // Si alguna falla, el servidor arranca igual y la integración con DATA queda deshabilitada.
            const migraciones = await ejecutarMigraciones(pool);
            esquema.fijar(migraciones.aplicadas);
            await dataSync.iniciar(pool, migraciones.aplicadas.has('004'));

            const server = app.listen(PORT, () => {
                console.log(`Servidor corriendo en http://localhost:${PORT}`);
                console.log(`API disponible en http://localhost:${PORT}/api`);
            });
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`\n⚠  El puerto ${PORT} ya está en uso.`);
                    console.error(`   El servidor ya está corriendo. No es necesario iniciarlo de nuevo.\n`);
                } else {
                    console.error('Error en el servidor:', err.message);
                }
                // No forzamos exit aquí para permitir mejores ciclos de desarrollo (nodemon)
            });
        } catch (error) {
            console.error('Error al iniciar el servidor:', error.message);
            process.exit(1);
        }
    }
    iniciarServidor();
}

module.exports = app;

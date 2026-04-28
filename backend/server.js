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

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowed = [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:3000',
            process.env.FRONTEND_URL // dominio de Vercel: https://tu-proyecto.vercel.app
        ].filter(Boolean);
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS no permitido para: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Capturar raw body para permitir verificación de firmas en webhooks
app.use(express.json({
    verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: true, verify: (req, res, buf) => { req.rawBody = buf; } }));

// Rutas API
app.use('/api/productos', productosRouter);
app.use('/api/envases', envasesRouter);
app.use('/api/kits', kitsRouter);
app.use('/api/top10', top10Router);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/mercadopago', mercadopagoRouter);

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
                        // Asegurarse de que la tabla Ordenes exista (migración mínima)
                        const createOrdersSQL = `
CREATE TABLE IF NOT EXISTS Ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_reference VARCHAR(100) UNIQUE,
    items JSON,
    total DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'COP',
    status ENUM('pending','approved','cancelled','failed','refunded') DEFAULT 'pending',
    preference_id VARCHAR(100),
    payment_id VARCHAR(100),
    payer_email VARCHAR(255),
    payer_name VARCHAR(255),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                        `;
                        try { await pool.query(createOrdersSQL); } catch (err) { console.warn('No se pudo crear tabla Ordenes automáticamente:', err.message || err); }
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

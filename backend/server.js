const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { getConnection } = require('./config/db');
const productosRouter = require('./routes/productos');
const envasesRouter = require('./routes/envases');
const authRouter = require('./routes/auth');
const uploadRouter = require('./routes/upload');

const app = express();
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
        if (!origin || allowed.includes(origin) || (process.env.VERCEL_URL && origin.endsWith('.vercel.app'))) {
            callback(null, true);
        } else {
            callback(new Error('CORS no permitido para: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/productos', productosRouter);
app.use('/api/envases', envasesRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);

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
            await getConnection();
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
                process.exit(1);
            });
        } catch (error) {
            console.error('Error al iniciar el servidor:', error.message);
            process.exit(1);
        }
    }
    iniciarServidor();
}

module.exports = app;

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ── En producción (Vercel) usa Cloudinary; en local usa disco ──────────────
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
    // Producción: almacenamiento en Cloudinary
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'altadensidad',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        }
    });
} else {
    // Local: almacenamiento en disco
    const UPLOAD_DIR = path.join(__dirname, '../../img');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, UPLOAD_DIR),
        filename: (req, file, cb) => {
            const ext  = path.extname(file.originalname).toLowerCase();
            const base = path.basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9_\-]/g, '_')
                .substring(0, 50);
            cb(null, `${Date.now()}_${base}${ext}`);
        }
    });
}

const ALLOWED_MIME = [
    'image/jpeg', 'image/jpg', 'image/png',
    'image/webp', 'image/avif', 'image/gif'
];

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato no permitido. Use JPG, PNG, WEBP o AVIF.'));
        }
    }
});

// POST /api/upload  — sube una imagen y devuelve su URL/ruta
router.post('/', upload.single('imagen'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se recibió ningún archivo.' });
    }
    // Cloudinary devuelve req.file.path (URL completa); disco devuelve req.file.filename
    const imagePath = req.file.path || `img/${req.file.filename}`;
    res.json({ success: true, path: imagePath });
});

// Manejador de errores de multer
router.use((err, req, res, next) => {
    res.status(400).json({ success: false, message: err.message });
});

module.exports = router;

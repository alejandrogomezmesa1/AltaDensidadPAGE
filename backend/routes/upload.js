const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { requireStaff } = require('../middleware/auth');

// HEIC/HEIF (fotos del iPhone): casi ningún navegador las muestra, así que en Cloudinary se
// convierten a JPG al subirlas. El sistema operativo a veces no informa el tipo: se mira la extensión.
const esHeic = (file) => /^image\/hei[cf]/i.test(file.mimetype || '') || /\.hei[cf]$/i.test(file.originalname || '');

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
        params: async (req, file) => ({
            folder: 'altadensidad',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'heic', 'heif'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            // HEIC → JPG al guardar: la URL resultante termina en .jpg y la ven todos los navegadores
            ...(esHeic(file) ? { format: 'jpg' } : {})
        })
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
    'image/webp', 'image/avif', 'image/gif',
    'image/heic', 'image/heif'
];

const upload = multer({
    storage,
    limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB (las fotos del iPhone pesan más)
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype) || esHeic(file)) {
            // Sin Cloudinary (local) no hay quién convierta el HEIC: se rechaza para no guardar algo que no se ve
            if (esHeic(file) && !process.env.CLOUDINARY_CLOUD_NAME) {
                return cb(new Error('Las fotos HEIC solo se pueden subir en producción (se convierten en Cloudinary). En local usa JPG o PNG.'));
            }
            cb(null, true);
        } else {
            cb(new Error('Formato no permitido. Use JPG, PNG, WEBP, AVIF o HEIC.'));
        }
    }
});

// POST /api/upload  — sube una imagen y devuelve su URL/ruta
router.post('/', requireStaff, upload.single('imagen'), (req, res) => {
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

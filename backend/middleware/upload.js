const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder uploads jika belum ada
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase())
                 && allowedTypes.test(file.mimetype);
    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (jpg, png, webp) yang diizinkan!'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
});

module.exports = upload;

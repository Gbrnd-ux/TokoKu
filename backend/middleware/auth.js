const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah expired' });
    }
};

// Middleware khusus admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Akses ditolak, hanya admin' });
    }
    next();
};

module.exports = { auth, adminOnly };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
);

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });

        const existing = await User.findByEmail(email);
        if (existing)
            return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

        const id = await User.create({ name, email, password, phone });
        const user = await User.findById(id);
        const token = generateToken(user);

        res.status(201).json({ success: true, message: 'Registrasi berhasil', token, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

        const user = await User.findByEmail(email);
        if (!user)
            return res.status(401).json({ success: false, message: 'Email atau password salah' });

        const valid = await User.comparePassword(password, user.password);
        if (!valid)
            return res.status(401).json({ success: false, message: 'Email atau password salah' });

        const token = generateToken(user);
        const { password: _, ...userData } = user;

        res.json({ success: true, message: 'Login berhasil', token, user: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        await User.update(req.user.id, { name, phone });
        const user = await User.findById(req.user.id);
        res.json({ success: true, message: 'Profil berhasil diperbarui', user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: ambil semua user
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

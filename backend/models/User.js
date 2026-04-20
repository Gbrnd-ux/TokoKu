const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await db.query(
            'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [id]
        );
        return rows[0] || null;
    },

    async create({ name, email, password, phone }) {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashed, phone || null]
        );
        return result.insertId;
    },

    async comparePassword(plain, hashed) {
        return bcrypt.compare(plain, hashed);
    },

    async update(id, { name, phone }) {
        await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, id]);
    },

    async getAll() {
        const [rows] = await db.query(
            'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    },
};

module.exports = User;

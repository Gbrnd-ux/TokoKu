const db = require('../config/db');

const Product = {
    async getAll({ search = '', category = '', page = 1, limit = 12 } = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = TRUE
        `;
        const params = [];

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        // Count total untuk pagination
        let countQuery = `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = TRUE`;
        const countParams = [];
        if (search) { countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
        if (category) { countQuery += ' AND c.slug = ?'; countParams.push(category); }
        const [[{ total }]] = await db.query(countQuery, countParams);

        return { products: rows, total, pages: Math.ceil(total / limit) };
    },

    async findById(id) {
        const [rows] = await db.query(
            'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
            [id]
        );
        return rows[0] || null;
    },

    async findBySlug(slug) {
        const [rows] = await db.query(
            'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?',
            [slug]
        );
        return rows[0] || null;
    },

    async create({ category_id, name, slug, description, price, stock, image }) {
        const [result] = await db.query(
            'INSERT INTO products (category_id, name, slug, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, slug, description, price, stock, image]
        );
        return result.insertId;
    },

    async update(id, data) {
        const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(data), id];
        await db.query(`UPDATE products SET ${fields} WHERE id = ?`, values);
    },

    async delete(id) {
        await db.query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
    },

    async decreaseStock(id, qty, conn) {
        const connection = conn || db;
        await connection.query(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [qty, id, qty]
        );
    },

    async getCategories() {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
        return rows;
    },
};

module.exports = Product;

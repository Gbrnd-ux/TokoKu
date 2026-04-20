const db = require('../config/db');

const Order = {
    async create({ userId, totalPrice, shippingAddress, paymentMethod, notes, items }, conn) {
        const connection = conn || db;

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_price, shipping_address, payment_method, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, totalPrice, shippingAddress, paymentMethod, notes || null]
        );
        const orderId = orderResult.insertId;

        // Insert order items
        const itemValues = items.map(i => [orderId, i.product_id, i.quantity, i.price]);
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [itemValues]
        );

        return orderId;
    },

    async findById(id) {
        const [[order]] = await db.query(
            `SELECT o.*, u.name AS user_name, u.email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ?`,
            [id]
        );
        if (!order) return null;

        const [items] = await db.query(
            `SELECT oi.*, p.name AS product_name, p.image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [id]
        );

        const [[payment]] = await db.query(
            'SELECT * FROM payments WHERE order_id = ?', [id]
        );

        return { ...order, items, payment: payment || null };
    },

    async getByUser(userId) {
        const [rows] = await db.query(
            `SELECT o.id, o.total_price, o.status, o.created_at,
                    COUNT(oi.id) AS item_count
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [userId]
        );
        return rows;
    },

    async getAll({ status = '', page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT o.id, o.total_price, o.status, o.created_at, u.name AS user_name
                     FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1`;
        const params = [];

        if (status) { query += ' AND o.status = ?'; params.push(status); }
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return rows;
    },

    async updateStatus(id, status) {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    },

    async createPayment({ orderId, amount, method, transactionId }) {
        await db.query(
            'INSERT INTO payments (order_id, amount, method, transaction_id) VALUES (?, ?, ?, ?)',
            [orderId, amount, method, transactionId]
        );
    },

    async updatePaymentStatus(orderId, status, transactionId) {
        const paid_at = status === 'success' ? new Date() : null;
        await db.query(
            'UPDATE payments SET status = ?, transaction_id = ?, paid_at = ? WHERE order_id = ?',
            [status, transactionId, paid_at, orderId]
        );
        if (status === 'success') {
            await db.query("UPDATE orders SET status = 'paid' WHERE id = ?", [orderId]);
        }
    },
};

module.exports = Order;

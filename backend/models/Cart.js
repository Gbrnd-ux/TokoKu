const db = require('../config/db');

const Cart = {
    async getByUser(userId) {
        const [rows] = await db.query(
            `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image, p.stock
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [userId]
        );
        return rows;
    },

    async addItem(userId, productId, quantity = 1) {
        // Jika sudah ada → update quantity, jika belum → insert
        await db.query(
            `INSERT INTO cart (user_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [userId, productId, quantity, quantity]
        );
    },

    async updateQuantity(userId, productId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(userId, productId);
        }
        await db.query(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
    },

    async removeItem(userId, productId) {
        await db.query(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
    },

    async clearCart(userId, conn) {
        const connection = conn || db;
        await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    },

    async countItems(userId) {
        const [[{ count }]] = await db.query(
            'SELECT SUM(quantity) AS count FROM cart WHERE user_id = ?',
            [userId]
        );
        return count || 0;
    },
};

module.exports = Cart;

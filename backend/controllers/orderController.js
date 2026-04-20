const midtransClient = require('midtrans-client');
const db = require('../config/db');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Midtrans Snap config
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

exports.createOrder = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { shipping_address, payment_method, notes } = req.body;
        const cartItems = await Cart.getByUser(req.user.id);

        if (!cartItems.length)
            return res.status(400).json({ success: false, message: 'Keranjang kosong' });

        // Validasi stok semua item
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await conn.rollback();
                return res.status(400).json({ success: false, message: `Stok ${item.name} tidak mencukupi` });
            }
        }

        const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const items = cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price }));

        const orderId = await Order.create({ userId: req.user.id, totalPrice, shippingAddress: shipping_address, paymentMethod: payment_method, notes, items }, conn);

        // Kurangi stok tiap produk
        for (const item of cartItems) {
            await Product.decreaseStock(item.product_id, item.quantity, conn);
        }

        // Hapus cart
        await Cart.clearCart(req.user.id, conn);

        await conn.commit();

        // Generate Midtrans token jika metode = midtrans
        let paymentToken = null;
        if (payment_method === 'midtrans') {
            const parameter = {
                transaction_details: { order_id: `ORDER-${orderId}-${Date.now()}`, gross_amount: totalPrice },
                customer_details: { first_name: req.user.name, email: req.user.email },
                item_details: cartItems.map(i => ({
                    id: String(i.product_id),
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name,
                })),
            };
            const midtransResponse = await snap.createTransaction(parameter);
            paymentToken = midtransResponse.token;

            await Order.createPayment({ orderId, amount: totalPrice, method: 'midtrans', transactionId: parameter.transaction_details.order_id });
        }

        const order = await Order.findById(orderId);
        res.status(201).json({ success: true, message: 'Order berhasil dibuat', order, paymentToken });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.getByUser(req.user.id);
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

        // User hanya bisa lihat order miliknya
        if (req.user.role !== 'admin' && order.user_id !== req.user.id)
            return res.status(403).json({ success: false, message: 'Akses ditolak' });

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: ambil semua order
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page, limit } = req.query;
        const orders = await Order.getAll({ status, page, limit });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: update status order
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Order.updateStatus(req.params.id, status);
        res.json({ success: true, message: 'Status order diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Midtrans Webhook
exports.midtransWebhook = async (req, res) => {
    try {
        const notification = req.body;
        const statusResponse = await snap.transaction.notification(notification);
        const { order_id, transaction_status, fraud_status } = statusResponse;

        const orderId = order_id.split('-')[1]; // ORDER-{id}-{timestamp}
        let paymentStatus = 'pending';

        if (transaction_status === 'capture' && fraud_status === 'accept') paymentStatus = 'success';
        else if (transaction_status === 'settlement') paymentStatus = 'success';
        else if (['cancel', 'deny', 'expire'].includes(transaction_status)) paymentStatus = 'failed';

        await Order.updatePaymentStatus(orderId, paymentStatus, order_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

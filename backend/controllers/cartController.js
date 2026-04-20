const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
    try {
        const items = await Cart.getByUser(req.user.id);
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        res.json({ success: true, items, total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

        if (product.stock < quantity)
            return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });

        await Cart.addItem(req.user.id, product_id, quantity);
        res.json({ success: true, message: 'Produk ditambahkan ke keranjang' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        await Cart.updateQuantity(req.user.id, product_id, quantity);
        res.json({ success: true, message: 'Keranjang diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        await Cart.removeItem(req.user.id, req.params.productId);
        res.json({ success: true, message: 'Produk dihapus dari keranjang' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await Cart.clearCart(req.user.id);
        res.json({ success: true, message: 'Keranjang dikosongkan' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const Product = require('../models/Product');
const slugify = require('../utils/slugify');

exports.getProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 12 } = req.query;
        const data = await Product.getAll({ search, category, page, limit });
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findBySlug(req.params.slug);
        if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.getCategories();
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: tambah produk
exports.createProduct = async (req, res) => {
    try {
        const { category_id, name, description, price, stock } = req.body;

        if (!name || !price)
            return res.status(400).json({ success: false, message: 'Nama dan harga wajib diisi' });

        const slug = slugify(name);
        const image = req.file ? req.file.filename : null;

        const id = await Product.create({ category_id, name, slug, description, price, stock, image });
        const product = await Product.findById(id);

        res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: update produk
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

        const updates = { ...req.body };
        if (req.file) updates.image = req.file.filename;
        if (updates.name) updates.slug = slugify(updates.name);

        await Product.update(id, updates);
        const updated = await Product.findById(id);
        res.json({ success: true, message: 'Produk berhasil diperbarui', product: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: hapus produk (soft delete)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.delete(id);
        res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

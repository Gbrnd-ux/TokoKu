const router = require('express').Router();
const { getProducts, getProductBySlug, getCategories, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',                        getProducts);
router.get('/categories',              getCategories);
router.get('/:slug',                   getProductBySlug);
router.post('/',     auth, adminOnly,  upload.single('image'), createProduct);
router.put('/:id',   auth, adminOnly,  upload.single('image'), updateProduct);
router.delete('/:id', auth, adminOnly, deleteProduct);

module.exports = router;

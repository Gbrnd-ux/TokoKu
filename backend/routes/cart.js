const router = require('express').Router();
const { getCart, addToCart, updateCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.get('/',                    auth, getCart);
router.post('/',                   auth, addToCart);
router.put('/',                    auth, updateCart);
router.delete('/clear',            auth, clearCart);
router.delete('/:productId',       auth, removeFromCart);

module.exports = router;

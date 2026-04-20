const router = require('express').Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    midtransWebhook,
} = require('../controllers/orderController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/webhook',             midtransWebhook);            // Midtrans webhook (no auth)
router.post('/',                    auth, createOrder);
router.get('/my',                   auth, getMyOrders);
router.get('/:id',                  auth, getOrderById);
router.get('/',                     auth, adminOnly, getAllOrders);
router.put('/:id/status',           auth, adminOnly, updateOrderStatus);

module.exports = router;

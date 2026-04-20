const router = require('express').Router();
const { register, login, getProfile, updateProfile, getAllUsers } = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/register',  register);
router.post('/login',     login);
router.get('/profile',    auth, getProfile);
router.put('/profile',    auth, updateProfile);
router.get('/users',      auth, adminOnly, getAllUsers);

module.exports = router;

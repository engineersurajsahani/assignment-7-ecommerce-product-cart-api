const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, checkout } = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');

router.get('/', authGuard, getCart);
router.post('/items', authGuard, addToCart);
router.delete('/items/:productId', authGuard, removeFromCart);
router.post('/checkout', authGuard, checkout);

module.exports = router;

const express = require('express');
const { getCart, addItemToCart, removeItemFromCart, checkout } = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

router.use(authGuard); // All cart routes require authentication

router.get('/', getCart);
router.post('/items', addItemToCart);
router.delete('/items/:productId', removeItemFromCart);
router.post('/checkout', checkout);

module.exports = router;

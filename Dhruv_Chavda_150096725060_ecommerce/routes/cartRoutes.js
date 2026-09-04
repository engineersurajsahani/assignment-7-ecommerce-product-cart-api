const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');

// All cart routes require authentication
router.use(authGuard);

// View current user's cart
router.get('/', cartController.getCart);

// Add product to cart (validates stock)
router.post('/items', cartController.addToCart);

// Remove specific product from cart
router.delete('/items/:productId', cartController.removeFromCart);

// Checkout and decrement stock
router.post('/checkout', cartController.checkout);

module.exports = router;

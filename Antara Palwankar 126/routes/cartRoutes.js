const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  removeItemFromCart,
  checkout
} = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');

// All cart routes require active user session authentication
router.use(authGuard);

// GET /api/cart - View current user's cart
router.get('/', getCart);

// POST /api/cart/items - Add product to cart (validates inventory)
router.post('/items', addItemToCart);

// DELETE /api/cart/items/:productId - Remove item from cart
router.delete('/items/:productId', removeItemFromCart);

// POST /api/cart/checkout - Simulate order checkout & decrement product stock
router.post('/checkout', checkout);

module.exports = router;

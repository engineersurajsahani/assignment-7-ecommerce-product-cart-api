const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  checkout
} = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');

// Protect all cart routes with authGuard
router.use(authGuard);

router.get('/', getCart);
router.post('/items', addToCart);
router.delete('/items/:productId', removeFromCart);
router.post('/checkout', checkout);

module.exports = router;

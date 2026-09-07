// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCart, addItem, removeItem, checkout } = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');

// All cart routes require an authenticated session.
router.use(authGuard);

router.get('/', getCart);
router.post('/items', addItem);
router.delete('/items/:productId', removeItem);
router.post('/checkout', checkout);

module.exports = router;

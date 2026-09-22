const express = require('express');
const router = express.Router();

const authGuard = require('../middleware/authGuard');

const {
  viewCart,
  addItemToCart,
  removeItemFromCart,
  checkout,
} = require('../controllers/cartController');

// Every cart route requires the user to be logged in
router.use(authGuard);

router.get('/', viewCart);
router.post('/items', addItemToCart);
router.delete('/items/:productId', removeItemFromCart);
router.post('/checkout', checkout);

module.exports = router;
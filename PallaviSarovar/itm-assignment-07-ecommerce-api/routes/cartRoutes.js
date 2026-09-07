const express = require('express');
const authGuard = require('../middleware/authGuard');
const {
  getCart,
  addItem,
  removeItem,
  checkout
} = require('../controllers/cartController');

const router = express.Router();

router.use(authGuard);

router.get('/', getCart);
router.post('/items', addItem);
router.delete('/items/:productId', removeItem);
router.post('/checkout', checkout);

module.exports = router;

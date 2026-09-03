const router = require('express').Router();
const controller = require('../controllers/cartController');
const authGuard = require('../middleware/authGuard');
router.use(authGuard);
router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.delete('/items/:productId', controller.removeItem);
router.post('/checkout', controller.checkout);
module.exports = router;

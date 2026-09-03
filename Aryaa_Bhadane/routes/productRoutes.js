const router = require('express').Router();
const controller = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');
router.get('/', controller.getProducts);
router.get('/:id', controller.getProduct);
router.post('/', validateProduct, controller.createProduct);
router.put('/:id', validateProduct, controller.updateProduct);
router.delete('/:id', controller.deleteProduct);
module.exports = router;

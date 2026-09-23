const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validateProduct, productController.addProduct);
router.put('/:id', validateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
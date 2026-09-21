const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', validateProduct, addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

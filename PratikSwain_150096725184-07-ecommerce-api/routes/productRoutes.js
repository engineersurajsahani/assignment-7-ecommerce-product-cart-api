const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { validateProduct, validateProductUpdate } = require('../middleware/validateProduct');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', validateProduct, createProduct);
router.put('/:id', validateProductUpdate, updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

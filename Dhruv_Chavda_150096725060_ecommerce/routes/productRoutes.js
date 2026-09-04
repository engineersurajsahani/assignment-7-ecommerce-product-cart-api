const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');

// Filter & search products
router.get('/', productController.getAllProducts);

// Fetch single product by ID
router.get('/:id', productController.getProductById);

// Add a new product
router.post('/', validateProduct, productController.createProduct);

// Update price or stock count or other details
router.put('/:id', validateProduct, productController.updateProduct);

// Remove product from store
router.delete('/:id', productController.deleteProduct);

module.exports = router;

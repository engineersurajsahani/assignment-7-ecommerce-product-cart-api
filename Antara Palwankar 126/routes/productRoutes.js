const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');

// GET /api/products - Filter, search & sort
router.get('/', getAllProducts);

// GET /api/products/:id - Fetch single product
router.get('/:id', getProductById);

// POST /api/products - Add a new product (validates price > 0, stock >= 0)
router.post('/', validateProduct, createProduct);

// PUT /api/products/:id - Update product price, stock, details
router.put('/:id', validateProduct, updateProduct);

// DELETE /api/products/:id - Remove product
router.delete('/:id', deleteProduct);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const validateProduct = require('../middleware/validateProduct');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Product management routes (kept simple — no complicated role system)
router.post('/', validateProduct({ requireCoreFields: true }), addProduct);
router.put('/:id', validateProduct(), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
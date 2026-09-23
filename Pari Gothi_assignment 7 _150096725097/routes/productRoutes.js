const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');
const adminGuard = require('../middleware/adminGuard');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', adminGuard, validateProduct, createProduct);
router.put('/:id', adminGuard, validateProduct, updateProduct);
router.delete('/:id', adminGuard, deleteProduct);

module.exports = router;

const express = require("express");
const router = express.Router();

const authGuard = require("../middleware/authGuard");
const validateProduct = require("../middleware/validateProduct");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected CRUD routes
router.post("/", authGuard, validateProduct, createProduct);
router.put("/:id", authGuard, validateProduct, updateProduct);
router.delete("/:id", authGuard, deleteProduct);

module.exports = router;
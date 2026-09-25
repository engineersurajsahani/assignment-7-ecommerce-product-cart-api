const express = require("express");
const { authGuard, adminOnly } = require("../middleware/authGuard");
const validateProduct = require("../middleware/validateProduct");
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// public: anyone can browse
router.get("/", getProducts);
// NOTE: must sit before "/:id" or Express would treat "categories" as an id.
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// admin only: login -> admin check -> body check -> controller
router.post("/", authGuard, adminOnly, validateProduct, createProduct);
router.put("/:id", authGuard, adminOnly, validateProduct, updateProduct);
router.delete("/:id", authGuard, adminOnly, deleteProduct);

module.exports = router;

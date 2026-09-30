const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authGuard");

const {
  getCart,
  addToCart,
  removeFromCart,
  checkout,
} = require("../controllers/cartController");

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addToCart);
router.delete("/items/:productId", removeFromCart);
router.post("/checkout", checkout);

module.exports = router;
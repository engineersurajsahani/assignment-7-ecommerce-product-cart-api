const express = require("express");
const { authGuard } = require("../middleware/authGuard");
const {
  getCart,
  addItem,
  removeItem,
  checkout,
  getOrders,
} = require("../controllers/cartController");

const router = express.Router();

// every cart route needs a logged-in user
router.use(authGuard);

router.get("/", getCart);
router.post("/items", addItem);
router.delete("/items/:productId", removeItem);
router.post("/checkout", checkout);
router.get("/orders", getOrders);

module.exports = router;

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("../middleware/authMiddleware");
const { getCartByUserId, saveCart } = require("../model/cartModel");
const {
  getProductById,
  getAllProducts,
  saveAllProducts
} = require("../model/productModel");

const router = express.Router();

router.use(authMiddleware);

const calculateCartTotal = (items) => {
  return items.reduce((total, item) => total + item.itemTotal, 0);
};

router.get("/", async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const cart = await getCartByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer greater than 0"
      });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const cart = await getCartByUserId(userId);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    const existingQty = existingItemIndex !== -1 ? cart.items[existingItemIndex].quantity : 0;
    const totalDesiredQty = existingQty + qty;

    if (totalDesiredQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${qty} item(s). Total requested quantity (${totalDesiredQty}) exceeds available stock (${product.stock}).`
      });
    }

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity = totalDesiredQty;
      cart.items[existingItemIndex].unitPrice = product.price;
      cart.items[existingItemIndex].itemTotal =
        cart.items[existingItemIndex].quantity * product.price;
    } else {
      const newItem = {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        itemTotal: product.price * qty
      };
      cart.items.push(newItem);
    }

    cart.cartTotal = calculateCartTotal(cart.items);

    const updatedCart = await saveCart(cart);

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const cart = await getCartByUserId(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    cart.items.splice(itemIndex, 1);

    cart.cartTotal = calculateCartTotal(cart.items);

    const updatedCart = await saveCart(cart);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
});

router.post("/checkout", async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const cart = await getCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your shopping cart is empty. Add items before checking out."
      });
    }

    const allProducts = await getAllProducts({});

    for (const item of cart.items) {
      const product = allProducts.find((p) => p.id === item.productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.name}' (ID: ${item.productId}) is no longer available in the catalog.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, In Cart: ${item.quantity}. Please adjust your cart.`
        });
      }
    }

    for (const item of cart.items) {
      const productIndex = allProducts.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        allProducts[productIndex].stock -= item.quantity;
      }
    }

    await saveAllProducts(allProducts);

    const purchasedItems = [...cart.items];
    const finalTotal = cart.cartTotal;

    cart.items = [];
    cart.cartTotal = 0;
    await saveCart(cart);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully! Checkout completed.",
      data: {
        orderId: uuidv4(),
        purchasedItems,
        finalTotal,
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

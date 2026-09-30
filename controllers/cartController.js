const path = require("path");
const { readJSON, writeJSON } = require("../utils/fileHelper");

const productsFile = path.join(__dirname, "../data/products.json");
const cartsFile = path.join(__dirname, "../data/carts.json");

// View current user's cart
const getCart = async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);

    const cart = carts.find(
      (cart) => cart.userId === req.session.userId
    );

    if (!cart) {
      return res.json({
        userId: req.session.userId,
        items: [],
        cartTotal: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Product ID and valid quantity are required",
      });
    }

    const products = await readJSON(productsFile);
    const carts = await readJSON(cartsFile);

    const product = products.find(
      (product) =>
        product.id.toString() === productId.toString()
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < Number(quantity)) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    let cart = carts.find(
      (cart) => cart.userId === req.session.userId
    );

    if (!cart) {
      cart = {
        userId: req.session.userId,
        items: [],
        cartTotal: 0,
      };

      carts.push(cart);
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === product.id.toString()
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + Number(quantity);

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.itemTotal =
        existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: Number(quantity),
        itemTotal: product.price * Number(quantity),
      });
    }

    cart.cartTotal = cart.items.reduce(
      (total, item) => total + item.itemTotal,
      0
    );

    cart.updatedAt = new Date().toISOString();

    await writeJSON(cartsFile, carts);

    res.json({
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

// Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);

    const cart = carts.find(
      (cart) => cart.userId === req.session.userId
    );

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) =>
        item.productId.toString() !==
        req.params.productId.toString()
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        message: "Product not in cart",
      });
    }

    cart.cartTotal = cart.items.reduce(
      (total, item) => total + item.itemTotal,
      0
    );

    cart.updatedAt = new Date().toISOString();

    await writeJSON(cartsFile, carts);

    res.json({
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product from cart",
      error: error.message,
    });
  }
};

// Checkout
const checkout = async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);
    const products = await readJSON(productsFile);

    const cart = carts.find(
      (cart) => cart.userId === req.session.userId
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Check stock for every item first
    for (const item of cart.items) {
      const product = products.find(
        (product) =>
          product.id.toString() === item.productId.toString()
      );

      if (!product) {
        return res.status(404).json({
          message: `Product ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // Reduce stock after all items pass validation
    for (const item of cart.items) {
      const product = products.find(
        (product) =>
          product.id.toString() === item.productId.toString()
      );

      product.stock -= item.quantity;
    }

    await writeJSON(productsFile, products);

    const orderTotal = cart.cartTotal;

    // Empty cart after successful checkout
    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();

    await writeJSON(cartsFile, carts);

    res.json({
      message: "Checkout successful",
      orderTotal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkout,
};
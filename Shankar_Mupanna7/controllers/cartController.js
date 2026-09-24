const { readData, writeData } = require('../utils/fileHelper');

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

// Helper to recalculate cart total
const recalculateCart = (cart) => {
  cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  cart.updatedAt = new Date().toISOString();
  return cart;
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData(CARTS_FILE);

    let userCart = carts.find((c) => c.userId === userId);
    if (!userCart) {
      userCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
    }

    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// POST /api/cart/items
const addItemToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Product ID is required.'
      });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Quantity must be a positive integer greater than 0.'
      });
    }

    // Read products to check existence and stock availability
    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${productId}' not found.`
      });
    }

    // Read carts to find user's cart
    const carts = await readData(CARTS_FILE);
    let userCartIndex = carts.findIndex((c) => c.userId === userId);

    if (userCartIndex === -1) {
      const newCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(newCart);
      userCartIndex = carts.length - 1;
    }

    const userCart = carts[userCartIndex];
    const existingItem = userCart.items.find((item) => item.productId === productId);
    const currentInCart = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentInCart + qty;

    // Inventory Reservation / Stock Validation Check
    if (totalRequested > product.stock) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Insufficient stock'
      });
    }

    if (existingItem) {
      existingItem.quantity = totalRequested;
      existingItem.itemTotal = existingItem.unitPrice * totalRequested;
    } else {
      userCart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        itemTotal: product.price * qty
      });
    }

    recalculateCart(userCart);
    await writeData(CARTS_FILE, carts);

    res.status(200).json({
      message: 'Item added to cart successfully.',
      cart: userCart
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// DELETE /api/cart/items/:productId
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData(CARTS_FILE);
    const userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not in cart'
      });
    }

    const itemIndex = userCart.items.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not in cart'
      });
    }

    userCart.items.splice(itemIndex, 1);
    recalculateCart(userCart);

    await writeData(CARTS_FILE, carts);

    res.status(200).json({
      message: 'Item removed from cart.',
      cart: userCart
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// POST /api/cart/checkout
const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const carts = await readData(CARTS_FILE);
    const userCart = carts.find((c) => c.userId === userId);

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cart is empty'
      });
    }

    const products = await readData(PRODUCTS_FILE);

    // Verify stock availability for all items before decrementing
    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Product '${item.name}' is no longer available.`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, in cart: ${item.quantity}`
        });
      }
    }

    // Decrement product stock in products.json
    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    }

    await writeData(PRODUCTS_FILE, products);

    const purchasedItems = [...userCart.items];
    const totalPaid = userCart.cartTotal;

    // Reset user's cart
    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();

    await writeData(CARTS_FILE, carts);

    res.status(200).json({
      message: 'Checkout successful! Order placed.',
      order: {
        userId,
        items: purchasedItems,
        totalPaid,
        orderDate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  checkout
};

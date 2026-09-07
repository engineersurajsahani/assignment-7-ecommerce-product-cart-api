// controllers/cartController.js
const { readData, writeData } = require('../utils/fileHelper');

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

/** Recompute itemTotal for every line item and the overall cartTotal. */
const recalculateCart = (cart) => {
  cart.items.forEach((item) => {
    item.itemTotal = item.unitPrice * item.quantity;
  });
  cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  cart.updatedAt = new Date().toISOString();
  return cart;
};

const findOrCreateCart = (carts, userId) => {
  let cart = carts.find((c) => c.userId === userId);
  if (!cart) {
    cart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
    carts.push(cart);
  }
  return cart;
};

/**
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId) || {
      userId,
      items: [],
      cartTotal: 0,
    };

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('[cartController.getCart]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/cart/items
 * Body: { productId, quantity }
 * Validates that requested quantity does not exceed available stock,
 * accounting for quantity already reserved in the cart.
 */
const addItem = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;

    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'productId is required and quantity must be a positive integer.',
      });
    }

    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const carts = await readData(CARTS_FILE);
    const cart = findOrCreateCart(carts, userId);

    const existingItem = cart.items.find((i) => i.productId === productId);
    const alreadyInCart = existingItem ? existingItem.quantity : 0;
    const requestedTotalQty = alreadyInCart + qty;

    if (requestedTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} unit(s) of "${product.name}" available (${alreadyInCart} already in your cart).`,
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotalQty;
      existingItem.unitPrice = product.price; // keep price in sync with catalog
      existingItem.name = product.name;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        itemTotal: product.price * qty,
      });
    }

    recalculateCart(cart);
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: cart,
    });
  } catch (error) {
    console.error('[cartController.addItem]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/cart/items/:productId
 */
const removeItem = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart || !cart.items.some((i) => i.productId === productId)) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    cart.items = cart.items.filter((i) => i.productId !== productId);
    recalculateCart(cart);
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: cart,
    });
  } catch (error) {
    console.error('[cartController.removeItem]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/cart/checkout
 * Decrements product stock for each cart line item, then empties the cart.
 * Re-validates stock at checkout time in case it changed since items were added.
 */
const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const products = await readData(PRODUCTS_FILE);

    // Re-validate stock for every line item before committing any changes.
    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" no longer exists.`,
        });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }
    }

    // Decrement stock now that every line item has been validated.
    cart.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    });

    await writeData(PRODUCTS_FILE, products);

    const orderSummary = {
      userId,
      items: cart.items,
      orderTotal: cart.cartTotal,
      placedAt: new Date().toISOString(),
    };

    // Empty the cart post-checkout.
    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Order placed successfully.',
      data: orderSummary,
    });
  } catch (error) {
    console.error('[cartController.checkout]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getCart, addItem, removeItem, checkout };

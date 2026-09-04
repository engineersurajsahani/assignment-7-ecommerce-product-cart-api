const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

/**
 * Helper to calculate cart items totals and overall cart total
 */
const recalculateCart = (cart) => {
  let cartTotal = 0;
  cart.items = (cart.items || []).map((item) => {
    const itemTotal = Number(item.unitPrice) * Number(item.quantity);
    cartTotal += itemTotal;
    return {
      ...item,
      unitPrice: Number(item.unitPrice),
      quantity: Number(item.quantity),
      itemTotal
    };
  });
  cart.cartTotal = cartTotal;
  cart.updatedAt = new Date().toISOString();
  return cart;
};

/**
 * View current user's cart
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    let userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      userCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
    } else {
      recalculateCart(userCart);
    }

    return res.status(200).json({
      success: true,
      cart: userCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a product to cart (with stock validation)
 * POST /api/cart/items
 */
const addToCart = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid productId is required.'
      });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.'
      });
    }

    const products = await readData('products.json');
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' not found.`
      });
    }

    const carts = await readData('carts.json');
    let userCartIndex = carts.findIndex((c) => c.userId === userId);
    let userCart;

    if (userCartIndex === -1) {
      userCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(userCart);
      userCartIndex = carts.length - 1;
    } else {
      userCart = carts[userCartIndex];
    }

    // Check existing quantity in cart
    const existingItemIndex = userCart.items.findIndex((item) => item.productId === productId);
    const currentQtyInCart = existingItemIndex > -1 ? userCart.items[existingItemIndex].quantity : 0;
    const totalRequestedQty = currentQtyInCart + qty;

    // Inventory stock check
    if (totalRequestedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, already in cart: ${currentQtyInCart}, requested addition: ${qty}.`
      });
    }

    if (existingItemIndex > -1) {
      userCart.items[existingItemIndex].quantity = totalRequestedQty;
      userCart.items[existingItemIndex].unitPrice = product.price;
      userCart.items[existingItemIndex].name = product.name;
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
    carts[userCartIndex] = userCart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully.',
      cart: userCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove specific product from cart
 * DELETE /api/cart/items/:productId
 */
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData('carts.json');
    const userCartIndex = carts.findIndex((c) => c.userId === userId);

    if (userCartIndex === -1 || !carts[userCartIndex].items.some((item) => item.productId === productId)) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' was not found in your cart.`
      });
    }

    const userCart = carts[userCartIndex];
    userCart.items = userCart.items.filter((item) => item.productId !== productId);
    recalculateCart(userCart);

    carts[userCartIndex] = userCart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully.',
      cart: userCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Checkout and decrement inventory stock
 * POST /api/cart/checkout
 */
const checkout = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    const userCartIndex = carts.findIndex((c) => c.userId === userId);

    if (userCartIndex === -1 || !carts[userCartIndex].items || carts[userCartIndex].items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Add products to cart before checking out.'
      });
    }

    const userCart = carts[userCartIndex];
    const products = await readData('products.json');

    // 1. Verify stock availability for ALL items before deducting any stock
    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.name}' (ID: ${item.productId}) no longer exists.`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, in cart: ${item.quantity}.`
        });
      }
    }

    // 2. Decrement stock for each product
    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    }

    // 3. Create order record / receipt
    const orderReceipt = {
      orderId: `ord_${uuidv4().substring(0, 8)}`,
      userId,
      items: [...userCart.items],
      orderTotal: userCart.cartTotal,
      status: 'Completed',
      orderDate: new Date().toISOString()
    };

    // 4. Clear user's cart
    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();
    carts[userCartIndex] = userCart;

    // 5. Persist updated products and carts atomically
    await writeData('products.json', products);
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Checkout successful! Your order has been placed.',
      order: orderReceipt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkout
};

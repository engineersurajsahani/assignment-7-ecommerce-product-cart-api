const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

/**
 * Helper to calculate cart total
 */
const calculateCartTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
};

/**
 * @route GET /api/cart
 * @desc View current user's cart with calculated total
 */
const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData(CARTS_FILE);

    let cart = carts.find(c => c.userId === userId);

    if (!cart) {
      cart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error in getCart controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch shopping cart.'
    });
  }
};

/**
 * @route POST /api/cart/items
 * @desc Add product to cart (Validates stock availability)
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity: reqQty } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'productId is required.'
      });
    }

    const quantity = reqQty !== undefined ? parseInt(reqQty, 10) : 1;
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Quantity must be a positive integer greater than 0.'
      });
    }

    // Read products and find target product
    const products = await readData(PRODUCTS_FILE);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${productId}' not found.`
      });
    }

    // Read carts and find user cart
    const carts = await readData(CARTS_FILE);
    let cartIndex = carts.findIndex(c => c.userId === userId);

    let userCart;
    if (cartIndex === -1) {
      userCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(userCart);
      cartIndex = carts.length - 1;
    } else {
      userCart = carts[cartIndex];
    }

    // Check existing item quantity in cart
    const existingItemIndex = userCart.items.findIndex(item => item.productId === productId);
    const currentInCart = existingItemIndex !== -1 ? userCart.items[existingItemIndex].quantity : 0;
    const requestedTotal = currentInCart + quantity;

    // Inventory reservation check / stock validation
    if (requestedTotal > product.stock) {
      return res.status(400).json({
        error: 'Out of Stock',
        message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, Currently in cart: ${currentInCart}, Requested addition: ${quantity}.`
      });
    }

    // Update or add item in cart
    if (existingItemIndex !== -1) {
      userCart.items[existingItemIndex].quantity = requestedTotal;
      userCart.items[existingItemIndex].unitPrice = product.price;
      userCart.items[existingItemIndex].itemTotal = requestedTotal * product.price;
    } else {
      userCart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: quantity * product.price
      });
    }

    userCart.cartTotal = calculateCartTotal(userCart.items);
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      message: 'Item added to cart successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Error in addToCart controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add item to cart.'
    });
  }
};

/**
 * @route DELETE /api/cart/items/:productId
 * @desc Remove specific product from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData(CARTS_FILE);
    const cartIndex = carts.findIndex(c => c.userId === userId);

    if (cartIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cart is empty or does not exist.'
      });
    }

    const userCart = carts[cartIndex];
    const itemIndex = userCart.items.findIndex(i => i.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${productId}' is not in your shopping cart.`
      });
    }

    userCart.items.splice(itemIndex, 1);
    userCart.cartTotal = calculateCartTotal(userCart.items);
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      message: 'Product removed from cart successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Error in removeFromCart controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove item from cart.'
    });
  }
};

/**
 * @route POST /api/cart/checkout
 * @desc Simulate order placement & decrement product stock
 */
const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const carts = await readData(CARTS_FILE);
    const cartIndex = carts.findIndex(c => c.userId === userId);

    if (cartIndex === -1 || !carts[cartIndex].items || carts[cartIndex].items.length === 0) {
      return res.status(400).json({
        error: 'Empty Cart',
        message: 'Cannot checkout: Your shopping cart is empty.'
      });
    }

    const userCart = carts[cartIndex];
    const products = await readData(PRODUCTS_FILE);

    // Validate stock for all items before decrementing
    for (const item of userCart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          error: 'Checkout Failed',
          message: `Product '${item.name}' (ID: ${item.productId}) no longer exists in catalog.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient Stock',
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, In Cart: ${item.quantity}. Please update your cart.`
        });
      }
    }

    // Decrement inventory stock
    for (const item of userCart.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
      }
    }

    // Save updated products stock
    await writeData(PRODUCTS_FILE, products);

    // Order summary snapshot
    const orderSummary = {
      orderId: `ord_${uuidv4().substring(0, 8)}`,
      purchasedItems: [...userCart.items],
      totalPaid: userCart.cartTotal,
      purchasedAt: new Date().toISOString()
    };

    // Reset user cart
    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      message: 'Checkout successful! Order placed and inventory updated.',
      order: orderSummary,
      cart: userCart
    });
  } catch (error) {
    console.error('Error in checkout controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process checkout.'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkout
};

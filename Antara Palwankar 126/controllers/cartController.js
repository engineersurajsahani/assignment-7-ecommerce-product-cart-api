const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

/**
 * Get current authenticated user's shopping cart
 * GET /api/cart
 */
const getCart = async (req, res) => {
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
    }

    // Ensure itemTotal and cartTotal are always consistent
    let recalculatedTotal = 0;
    userCart.items = userCart.items.map((item) => {
      const itemTotal = item.unitPrice * item.quantity;
      recalculatedTotal += itemTotal;
      return {
        ...item,
        itemTotal
      };
    });
    userCart.cartTotal = recalculatedTotal;

    return res.status(200).json({
      success: true,
      cart: userCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cart'
    });
  }
};

/**
 * Add product to cart with inventory/stock validation
 * POST /api/cart/items
 */
const addItemToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const qtyToAdd = quantity !== undefined ? Number(quantity) : 1;
    if (isNaN(qtyToAdd) || qtyToAdd <= 0 || !Number.isInteger(qtyToAdd)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    // 1. Fetch product to verify existence and stock
    const products = await readData('products.json');
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' not found`
      });
    }

    // 2. Fetch or create user cart
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

    // 3. Check existing quantity in cart
    const existingItemIndex = userCart.items.findIndex((item) => item.productId === productId);
    const currentQtyInCart = existingItemIndex > -1 ? userCart.items[existingItemIndex].quantity : 0;
    const requestedTotalQty = currentQtyInCart + qtyToAdd;

    // 4. Validate stock availability
    if (product.stock < requestedTotalQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, requested in total: ${requestedTotalQty}`
      });
    }

    // 5. Update or add item in cart
    if (existingItemIndex > -1) {
      userCart.items[existingItemIndex].quantity = requestedTotalQty;
      userCart.items[existingItemIndex].unitPrice = product.price; // Keep price sync
      userCart.items[existingItemIndex].itemTotal = requestedTotalQty * product.price;
    } else {
      userCart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qtyToAdd,
        itemTotal: qtyToAdd * product.price
      });
    }

    // 6. Recalculate cart total
    userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    carts[userCartIndex] = userCart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding item to cart'
    });
  }
};

/**
 * Remove specific product from cart
 * DELETE /api/cart/items/:productId
 */
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData('carts.json');
    const userCartIndex = carts.findIndex((c) => c.userId === userId);

    if (userCartIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty or does not exist'
      });
    }

    const userCart = carts[userCartIndex];
    const itemIndex = userCart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' is not in your cart`
      });
    }

    // Remove item
    userCart.items.splice(itemIndex, 1);
    userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    carts[userCartIndex] = userCart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing item from cart'
    });
  }
};

/**
 * Simulate checkout, decrement product stock, and clear user's cart
 * POST /api/cart/checkout
 */
const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    const userCartIndex = carts.findIndex((c) => c.userId === userId);

    if (userCartIndex === -1 || carts[userCartIndex].items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot checkout an empty cart'
      });
    }

    const userCart = carts[userCartIndex];
    const products = await readData('products.json');

    // 1. Verify all items have sufficient stock
    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.name}' (${item.productId}) no longer exists in store catalog`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, required: ${item.quantity}`
        });
      }
    }

    // 2. Decrement inventory stock
    for (const item of userCart.items) {
      const productIndex = products.findIndex((p) => p.id === item.productId);
      products[productIndex].stock -= item.quantity;
    }
    await writeData('products.json', products);

    // 3. Create order summary
    const orderSummary = {
      orderId: `ord_${uuidv4().substring(0, 8)}`,
      userId,
      items: [...userCart.items],
      totalAmount: userCart.cartTotal,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // 4. Clear user's cart
    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();
    carts[userCartIndex] = userCart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Order placed successfully! Product stock has been updated.',
      order: orderSummary
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during checkout'
    });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  checkout
};

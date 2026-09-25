
const { readData, writeData } = require('../utils/fileHelper');

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

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

const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId) || {
      userId,
      items: [],
      cartTotal: 0,
      updatedAt: null,
    };

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;

    if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'productId and a positive numeric quantity are required',
      });
    }

    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const carts = await readData(CARTS_FILE);
    const cart = findOrCreateCart(carts, userId);

    const existingItem = cart.items.find((item) => item.productId === productId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const requestedTotalQty = currentQtyInCart + quantity;

    if (requestedTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Out of Stock: only ${product.stock} unit(s) of "${product.name}" available (you already have ${currentQtyInCart} in your cart)`,
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotalQty;
      existingItem.unitPrice = product.price;
      existingItem.name = product.name;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity,
      });
    }

    recalculateCart(cart);
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const index = cart.items.findIndex((item) => item.productId === productId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    cart.items.splice(index, 1);
    recalculateCart(cart);
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Empty Cart: nothing to check out' });
    }

    const products = await readData(PRODUCTS_FILE);


    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" no longer exists`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}": only ${product.stock} left`,
        });
      }
    }


    cart.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    });

    await writeData(PRODUCTS_FILE, products);

    const order = {
      userId,
      items: cart.items,
      orderTotal: cart.cartTotal,
      placedAt: new Date().toISOString(),
    };


    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Checkout successful',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getCart, addItemToCart, removeItemFromCart, checkout };

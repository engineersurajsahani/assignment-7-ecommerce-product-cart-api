const { readData, writeData } = require('../utils/fileHelper');
const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

const calcTotal = (items) => items.reduce((sum, item) => sum + item.itemTotal, 0);

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const carts = await readData(CARTS_FILE);
    const userId = req.session.user.id;

    let cart = carts.find((c) => c.userId === userId);
    if (!cart) {
      cart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart.', error: error.message });
  }
};

// POST /api/cart/items
const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'productId and a positive quantity are required.' });
    }

    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const carts = await readData(CARTS_FILE);
    let cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      cart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
      carts.push(cart);
    }

    const existingItem = cart.items.find((i) => i.productId === productId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const requestedTotalQty = currentQtyInCart + quantity;

    if (requestedTotalQty > product.stock) {
      return res.status(400).json({
        message: `Out of stock. Only ${product.stock} unit(s) available, ${currentQtyInCart} already in cart.`,
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotalQty;
      existingItem.itemTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity,
      });
    }

    cart.cartTotal = calcTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await writeData(CARTS_FILE, carts);

    res.status(200).json({ message: 'Item added to cart.', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to cart.', error: error.message });
  }
};

// DELETE /api/cart/items/:productId
const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.user.id;

    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex((i) => i.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not in cart.' });
    }

    cart.items.splice(itemIndex, 1);
    cart.cartTotal = calcTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await writeData(CARTS_FILE, carts);

    res.status(200).json({ message: 'Item removed from cart.', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item.', error: error.message });
  }
};

// POST /api/cart/checkout
const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const carts = await readData(CARTS_FILE);
    const cart = carts.find((c) => c.userId === userId);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const products = await readData(PRODUCTS_FILE);
    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.name}". Checkout aborted.`,
        });
      }
    }

    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    }

    await writeData(PRODUCTS_FILE, products);

    const orderSummary = {
      userId,
      items: cart.items,
      orderTotal: cart.cartTotal,
      placedAt: new Date().toISOString(),
    };

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();
    await writeData(CARTS_FILE, carts);

    res.status(200).json({ message: 'Order placed successfully.', order: orderSummary });
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed.', error: error.message });
  }
};

module.exports = { getCart, addItem, removeItem, checkout };

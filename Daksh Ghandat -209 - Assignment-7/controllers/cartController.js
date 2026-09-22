const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';
const CARTS_FILE = 'carts.json';

// Recalculate each item's total and the overall cart total.
const recalculateCart = (cart) => {
  for (const item of cart.items) {
    item.itemTotal = item.unitPrice * item.quantity;
  }

  cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  cart.updatedAt = new Date().toISOString();

  return cart;
};

const getCartForUser = async (userId) => {
  const carts = await readData(CARTS_FILE);
  const cart = carts.find((c) => c.userId === userId);

  // Return an empty cart if the user does not have one yet.
  return cart || {
    userId,
    items: [],
    cartTotal: 0,
    updatedAt: null,
  };
};

const viewCart = async (req, res) => {
  const userId = req.session.user.id;
  const cart = await getCartForUser(userId);

  return res.status(200).json(cart);
};

const addItemToCart = async (req, res) => {
  const userId = req.session.user.id;
  const { productId, quantity } = req.body || {};

  // 1. Validate the productId
  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ message: 'productId is required' });
  }

  // 2. Validate quantity is a positive integer
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'quantity must be a positive integer' });
  }

  // 3. Find the product
  const products = await readData(PRODUCTS_FILE);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // 4. Find the user's existing cart (or create an empty one)
  const carts = await readData(CARTS_FILE);
  let cart = carts.find((c) => c.userId === userId);

  if (!cart) {
    cart = {
      userId,
      items: [],
      cartTotal: 0,
      updatedAt: null,
    };
    carts.push(cart);
  }

  // 5. Check stock against the TOTAL requested quantity
  const existingItem = cart.items.find((item) => item.productId === productId);
  const existingQuantity = existingItem ? existingItem.quantity : 0;
  const totalQuantity = existingQuantity + quantity;

  if (totalQuantity > product.stock) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  // 6. Add the item or increase its quantity
  if (existingItem) {
    existingItem.quantity = totalQuantity;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      itemTotal: product.price * quantity,
    });
  }

  // 7. Recalculate totals and save
  recalculateCart(cart);
  await writeData(CARTS_FILE, carts);

  return res.status(200).json(cart);
};

const removeItemFromCart = async (req, res) => {
  const userId = req.session.user.id;
  const { productId } = req.params;

  const carts = await readData(CARTS_FILE);
  const cart = carts.find((c) => c.userId === userId);

  if (!cart) {
    return res.status(404).json({ message: 'Product not found in cart' });
  }

  const itemIndex = cart.items.findIndex((item) => item.productId === productId);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Product not found in cart' });
  }

  cart.items.splice(itemIndex, 1);
  recalculateCart(cart);
  await writeData(CARTS_FILE, carts);

  return res.status(200).json(cart);
};

const checkout = async (req, res) => {
  const userId = req.session.user.id;

  // 1. Find the user's cart
  const carts = await readData(CARTS_FILE);
  const cart = carts.find((c) => c.userId === userId);

  // 2. Reject an empty (or missing) cart
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // 3. Re-read products.json to make sure we validate against fresh stock
  const products = await readData(PRODUCTS_FILE);

  // 4. Validate stock AGAIN for every cart item
  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product || item.quantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
  }

  // 5. Decrement product stock for every cart item
  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId);
    product.stock -= item.quantity;
  }

  await writeData(PRODUCTS_FILE, products);

  // 6. Calculate the final total
  const orderItems = cart.items.map((item) => ({ ...item }));
  const total = orderItems.reduce((sum, item) => sum + item.itemTotal, 0);

  // 7. Clear the user's cart
  cart.items = [];
  cart.cartTotal = 0;
  cart.updatedAt = new Date().toISOString();

  await writeData(CARTS_FILE, carts);

  // 8. Return the simulated order
  return res.status(200).json({
    message: 'Checkout successful',
    order: {
      userId,
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
    },
  });
};

module.exports = {
  viewCart,
  addItemToCart,
  removeItemFromCart,
  checkout,
};
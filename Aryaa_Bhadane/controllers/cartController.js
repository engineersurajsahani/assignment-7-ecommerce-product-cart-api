const { readData, writeData, withDataLock } = require('../utils/fileHelper');

const emptyCart = (userId) => ({ userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() });
const recalculate = (cart) => {
  cart.items.forEach((item) => { item.itemTotal = item.unitPrice * item.quantity; });
  cart.cartTotal = cart.items.reduce((total, item) => total + item.itemTotal, 0);
  cart.updatedAt = new Date().toISOString();
  return cart;
};

const getCart = async (req, res, next) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find((entry) => entry.userId === req.session.user.id) || emptyCart(req.session.user.id);
    // Totals are persisted at mutation time; no calculation is performed on this read.
    res.json({ cart });
  } catch (error) { next(error); }
};

const addItem = async (req, res, next) => {
  const { productId, quantity } = req.body;
  if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'productId and a positive integer quantity are required' });
  }
  try {
    const cart = await withDataLock(async () => {
      const products = await readData('products.json');
      const product = products.find((entry) => entry.id === productId);
      if (!product) { const error = new Error('Product not found'); error.status = 404; throw error; }
      const carts = await readData('carts.json');
      let cart = carts.find((entry) => entry.userId === req.session.user.id);
      if (!cart) { cart = emptyCart(req.session.user.id); carts.push(cart); }
      const item = cart.items.find((entry) => entry.productId === productId);
      const requestedTotal = (item ? item.quantity : 0) + Number(quantity);
      // This reads products inside the lock immediately before the cart write.
      if (requestedTotal > product.stock) { const error = new Error('Insufficient stock'); error.status = 400; throw error; }
      if (item) {
        item.quantity = requestedTotal;
        item.name = product.name;
        item.unitPrice = product.price;
      } else {
        cart.items.push({ productId: product.id, name: product.name, unitPrice: product.price, quantity: Number(quantity), itemTotal: 0 });
      }
      recalculate(cart);
      await writeData('carts.json', carts);
      return cart;
    });
    res.json({ message: 'Item added to cart', cart });
  } catch (error) { next(error); }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await withDataLock(async () => {
      const carts = await readData('carts.json');
      const cart = carts.find((entry) => entry.userId === req.session.user.id);
      if (!cart) { const error = new Error('Cart item not found'); error.status = 404; throw error; }
      const index = cart.items.findIndex((entry) => entry.productId === req.params.productId);
      if (index === -1) { const error = new Error('Cart item not found'); error.status = 404; throw error; }
      cart.items.splice(index, 1);
      recalculate(cart);
      await writeData('carts.json', carts);
      return cart;
    });
    res.json({ message: 'Item removed from cart', cart });
  } catch (error) { next(error); }
};

const checkout = async (req, res, next) => {
  try {
    const order = await withDataLock(async () => {
      const carts = await readData('carts.json');
      const cartIndex = carts.findIndex((entry) => entry.userId === req.session.user.id);
      if (cartIndex === -1 || carts[cartIndex].items.length === 0) { const error = new Error('Cart is empty'); error.status = 400; throw error; }
      const cart = carts[cartIndex];
      const products = await readData('products.json');
      for (const item of cart.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product || product.stock < item.quantity) { const error = new Error(`Insufficient stock for ${item.name}`); error.status = 400; throw error; }
      }
      for (const item of cart.items) products.find((entry) => entry.id === item.productId).stock -= item.quantity;
      await writeData('products.json', products);
      const order = { items: cart.items, cartTotal: cart.cartTotal };
      carts.splice(cartIndex, 1);
      await writeData('carts.json', carts);
      return order;
    });
    res.json({ message: 'Checkout successful', order });
  } catch (error) { next(error); }
};

module.exports = { getCart, addItem, removeItem, checkout };

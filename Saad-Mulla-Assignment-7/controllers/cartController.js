const { readData, writeData } = require('../utils/fileHelper');

const getCartData = async (userId) => {
  const carts = await readData('carts.json');
  return carts.find(c => c.userId === userId) || { userId, items: [], cartTotal: 0 };
};

const saveCartData = async (cart) => {
  const carts = await readData('carts.json');
  const index = carts.findIndex(c => c.userId === cart.userId);
  cart.updatedAt = new Date().toISOString();
  
  cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  
  if (index !== -1) carts[index] = cart;
  else carts.push(cart);
  
  await writeData('carts.json', carts);
};

exports.getCart = async (req, res) => {
  const cart = await getCartData(req.session.user.id);
  res.status(200).json(cart);
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const products = await readData('products.json');
  const product = products.find(p => p.id === productId);
  
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  const cart = await getCartData(req.session.user.id);
  const existingItem = cart.items.find(i => i.productId === productId);
  const requestedQty = existingItem ? existingItem.quantity + quantity : quantity;
  
  if (requestedQty > product.stock) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }
  
  if (existingItem) {
    existingItem.quantity = requestedQty;
    existingItem.itemTotal = existingItem.quantity * existingItem.unitPrice;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      itemTotal: quantity * product.price
    });
  }
  
  await saveCartData(cart);
  res.status(200).json(cart);
};

exports.removeFromCart = async (req, res) => {
  const cart = await getCartData(req.session.user.id);
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  
  if (cart.items.length === initialLength) return res.status(404).json({ error: 'Item not in cart' });
  
  await saveCartData(cart);
  res.status(200).json(cart);
};

exports.checkout = async (req, res) => {
  const cart = await getCartData(req.session.user.id);
  if (cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  
  let products = await readData('products.json');
  
  // Verify stock again before final checkout
  for (const item of cart.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ error: `Product ${item.name} is out of stock or insufficient quantity` });
    }
  }
  
  // Deduct stock
  cart.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  });
  
  await writeData('products.json', products);
  
  // Clear Cart
  cart.items = [];
  cart.cartTotal = 0;
  await saveCartData(cart);
  
  res.status(200).json({ message: 'Checkout successful', orderTotal: cart.cartTotal });
};
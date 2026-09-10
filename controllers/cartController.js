const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const userId = req.session.user.id;

    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      return res.status(200).json({ userId, items: [], cartTotal: 0 });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'productId and a positive quantity are required' });
    }

    const products = await readData('products.json');
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const carts = await readData('carts.json');
    let cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      cart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
      carts.push(cart);
    }

    const existingItem = cart.items.find((i) => i.productId === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      existingItem.quantity = newQuantity;
      existingItem.itemTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity
      });
    }

    cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.user.id;

    const carts = await readData('carts.json');
    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((i) => i.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    cart.items.splice(itemIndex, 1);
    cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const carts = await readData('carts.json');
    const cart = carts.find((c) => c.userId === userId);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const products = await readData('products.json');

    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}`
        });
      }
    }

    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    }

    await writeData('products.json', products);

    const orderSummary = {
      userId,
      items: cart.items,
      total: cart.cartTotal,
      completedAt: new Date().toISOString()
    };

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({ message: 'Order placed successfully', order: orderSummary });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCart, addItemToCart, removeItemFromCart, checkout };

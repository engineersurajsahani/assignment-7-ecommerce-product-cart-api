const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const carts = await readData('carts.json');
    const cart = carts.find(c => c.userId === userId) || { userId, items: [], cartTotal: 0 };
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addItemToCart = async (req, res) => {
  const userId = req.session.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid productId or quantity' });
  }

  try {
    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Out of Stock or Insufficient stock' });
    }

    const carts = await readData('carts.json');
    let cart = carts.find(c => c.userId === userId);

    if (!cart) {
      cart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
      carts.push(cart);
    }

    const existingItem = cart.items.find(i => i.productId === productId);
    
    // Check if total quantity will exceed stock
    if (existingItem && (existingItem.quantity + quantity > product.stock)) {
      return res.status(400).json({ success: false, message: 'Insufficient stock to add this quantity' });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.itemTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity
      });
    }

    cart.cartTotal = cart.items.reduce((acc, curr) => acc + curr.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);
    res.status(200).json({ success: true, data: cart });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  const userId = req.session.user.id;
  const { productId } = req.params;

  try {
    const carts = await readData('carts.json');
    const cart = carts.find(c => c.userId === userId);

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(i => i.productId !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    cart.cartTotal = cart.items.reduce((acc, curr) => acc + curr.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkout = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === userId);

    if (cartIndex === -1 || carts[cartIndex].items.length === 0) {
      return res.status(400).json({ success: false, message: 'Empty Cart' });
    }

    const cart = carts[cartIndex];
    let products = await readData('products.json');

    // Double check stock for all items
    for (let item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.name}` });
      }
    }

    // Decrement stock
    for (let item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }

    // Empty cart
    carts[cartIndex].items = [];
    carts[cartIndex].cartTotal = 0;
    carts[cartIndex].updatedAt = new Date().toISOString();

    // Save changes
    await writeData('products.json', products);
    await writeData('carts.json', carts);

    res.status(200).json({ success: true, message: 'Checkout successful. Order placed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addItemToCart, removeItemFromCart, checkout };

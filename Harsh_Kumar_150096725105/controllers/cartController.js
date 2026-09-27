const { readData, writeData } = require('../utils/fileHelper');

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.itemTotal, 0);
};

exports.getCart = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find(c => c.userId === req.session.user.id) || { userId: req.session.user.id, items: [], cartTotal: 0 };
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    const carts = await readData('carts.json');
    let cart = carts.find(c => c.userId === userId);
    
    if (!cart) {
      cart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
      carts.push(cart);
    }

    const itemIndex = cart.items.findIndex(i => i.productId === productId);
    
    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock for combined quantity' });
      }
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].itemTotal = newQuantity * product.price;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: quantity * product.price
      });
    }

    cart.cartTotal = calculateTotal(cart.items);
    cart.updatedAt = new Date().toISOString();
    
    await writeData('carts.json', carts);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.session.user.id;
    
    const carts = await readData('carts.json');
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(i => i.productId !== productId);
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Product not in cart' });
    }
    
    cart.cartTotal = calculateTotal(cart.items);
    cart.updatedAt = new Date().toISOString();
    
    await writeData('carts.json', carts);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    const products = await readData('products.json');
    
    const cartIndex = carts.findIndex(c => c.userId === userId);
    if (cartIndex === -1 || carts[cartIndex].items.length === 0) {
      return res.status(400).json({ message: 'Empty Cart' });
    }
    
    const cart = carts[cartIndex];
    
    // Validate stock again before checkout
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.name}` });
      }
    }
    
    // Decrement stock
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }
    
    // Clear cart
    carts.splice(cartIndex, 1);
    
    await writeData('products.json', products);
    await writeData('carts.json', carts);
    
    res.json({ message: 'Checkout successful, order placed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

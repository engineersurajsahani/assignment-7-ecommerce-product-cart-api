const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart) {
      return res.status(200).json({ userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid productId and quantity are required' });
    }
    
    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock', available: product.stock });
    }
    
    const carts = await readData('carts.json');
    let cart = carts.find(c => c.userId === userId);
    
    if (!cart) {
      cart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(cart);
    }
    
    const existingItemIndex = cart.items.findIndex(i => i.productId === productId);
    
    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock', available: product.stock, inCart: cart.items[existingItemIndex].quantity });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].itemTotal = newQuantity * product.price;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: quantity * product.price
      });
    }
    
    cart.cartTotal = cart.items.reduce((total, item) => total + item.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();
    
    await writeData('carts.json', carts);
    
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;
    
    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === userId);
    
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const cart = carts[cartIndex];
    const itemIndex = cart.items.findIndex(i => i.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Product not in cart' });
    }
    
    cart.items.splice(itemIndex, 1);
    cart.cartTotal = cart.items.reduce((total, item) => total + item.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();
    
    await writeData('carts.json', carts);
    
    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === userId);
    
    if (cartIndex === -1 || carts[cartIndex].items.length === 0) {
      return res.status(400).json({ error: 'Empty cart' });
    }
    
    const cart = carts[cartIndex];
    const products = await readData('products.json');
    
    for (const item of cart.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex === -1) {
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }
      if (products[productIndex].stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name}`, available: products[productIndex].stock, requested: item.quantity });
      }
      products[productIndex].stock -= item.quantity;
    }
    
    await writeData('products.json', products);
    
    carts.splice(cartIndex, 1);
    await writeData('carts.json', carts);
    
    res.status(200).json({ 
      message: 'Checkout successful', 
      orderTotal: cart.cartTotal,
      items: cart.items 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCart, addToCart, removeFromCart, checkout };

const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    let userCart = carts.find(c => c.userId === userId);

    if (!userCart) {
      userCart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
    }

    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Valid productId and quantity are required' });
    }

    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    let carts = await readData('carts.json');
    let userCart = carts.find(c => c.userId === userId);

    if (!userCart) {
      userCart = { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
      carts.push(userCart);
    }

    const existingItem = userCart.items.find(i => i.productId === productId);

    if (existingItem) {
      if (product.stock < existingItem.quantity + quantity) {
        return res.status(400).json({ error: 'Insufficient stock for additional quantity' });
      }
      existingItem.quantity += quantity;
      existingItem.itemTotal = existingItem.quantity * product.price;
    } else {
      userCart.items.push({
        productId,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity
      });
    }

    userCart.cartTotal = userCart.items.reduce((total, item) => total + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    let carts = await readData('carts.json');
    let userCart = carts.find(c => c.userId === userId);

    if (!userCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = userCart.items.findIndex(i => i.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    userCart.items.splice(itemIndex, 1);
    userCart.cartTotal = userCart.items.reduce((total, item) => total + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    let carts = await readData('carts.json');
    const userCart = carts.find(c => c.userId === userId);

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ error: 'Empty cart' });
    }

    let products = await readData('products.json');

    // Validate stock for all items before proceeding
    for (const item of userCart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.name}` });
      }
    }

    // Deduct stock
    for (const item of userCart.items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }

    // Clear cart
    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();

    await writeData('products.json', products);
    await writeData('carts.json', carts);

    res.status(200).json({ message: 'Checkout successful', cart: userCart });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
};

module.exports = { getCart, addItemToCart, removeItemFromCart, checkout };

const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find(item => item.userId === req.session.user.id);

    if (!cart) {
      return res.status(200).json({
        userId: req.session.user.id,
        items: [],
        cartTotal: 0
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: 'productId and a positive integer quantity are required.'
      });
    }

    const products = await readData('products.json');
    const carts = await readData('carts.json');

    const product = products.find(item => item.id === productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    let cart = carts.find(item => item.userId === req.session.user.id);

    if (!cart) {
      cart = {
        userId: req.session.user.id,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(cart);
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const requestedTotal = currentQuantity + quantity;

    if (requestedTotal > product.stock) {
      return res.status(400).json({
        message: 'Insufficient stock.',
        availableStock: product.stock
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
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

    cart.cartTotal = cart.items.reduce(
      (total, item) => total + item.itemTotal,
      0
    );
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    res.status(200).json({
      message: 'Item added to cart.',
      cart
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const removeItem = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find(item => item.userId === req.session.user.id);

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found.'
      });
    }

    const index = cart.items.findIndex(
      item => item.productId === req.params.productId
    );

    if (index === -1) {
      return res.status(404).json({
        message: 'Product is not in cart.'
      });
    }

    cart.items.splice(index, 1);

    cart.cartTotal = cart.items.reduce(
      (total, item) => total + item.itemTotal,
      0
    );
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    res.status(200).json({
      message: 'Item removed from cart.',
      cart
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const checkout = async (req, res) => {
  try {
    const products = await readData('products.json');
    const carts = await readData('carts.json');

    const cart = carts.find(item => item.userId === req.session.user.id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty.'
      });
    }

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}.`
        });
      }
    }

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }

    const order = {
      orderId: `order_${Date.now()}`,
      userId: req.session.user.id,
      items: cart.items,
      total: cart.cartTotal,
      placedAt: new Date().toISOString()
    };

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();

    await writeData('products.json', products);
    await writeData('carts.json', carts);

    res.status(200).json({
      message: 'Checkout successful.',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getCart,
  addItem,
  removeItem,
  checkout
};
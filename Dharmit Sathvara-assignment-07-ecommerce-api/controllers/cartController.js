const { readData, writeData } = require('../utils/fileHelper');

const calculateCart = cart => {
  cart.items = cart.items.map(item => ({
    ...item,
    itemTotal: Number((item.unitPrice * item.quantity).toFixed(2))
  }));

  cart.cartTotal = Number(
    cart.items.reduce((sum, item) => sum + item.itemTotal, 0).toFixed(2)
  );

  cart.updatedAt = new Date().toISOString();
  return cart;
};

const getOrCreateCart = async userId => {
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
    await writeData('carts.json', carts);
  }

  return { carts, cart };
};

const getCart = async (req, res, next) => {
  try {
    const { cart } = await getOrCreateCart(req.session.user.id);
    res.json(calculateCart(cart));
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: 'productId and a positive integer quantity are required'
      });
    }

    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { carts, cart } = await getOrCreateCart(req.session.user.id);
    const existingItem = cart.items.find(item => item.productId === productId);
    const requestedQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (requestedQuantity > product.stock) {
      return res.status(400).json({
        message: 'Insufficient stock',
        availableStock: product.stock
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedQuantity;
      existingItem.unitPrice = product.price;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: Number((product.price * quantity).toFixed(2))
      });
    }

    calculateCart(cart);
    await writeData('carts.json', carts);

    res.json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find(c => c.userId === req.session.user.id);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const index = cart.items.findIndex(
      item => item.productId === req.params.productId
    );

    if (index === -1) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    const [removedItem] = cart.items.splice(index, 1);
    calculateCart(cart);
    await writeData('carts.json', carts);

    res.json({
      message: 'Item removed from cart',
      removedItem,
      cart
    });
  } catch (error) {
    next(error);
  }
};

const checkout = async (req, res, next) => {
  try {
    const carts = await readData('carts.json');
    const products = await readData('products.json');

    const cart = carts.find(c => c.userId === req.session.user.id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.productId} no longer exists`
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
          availableStock: product.stock
        });
      }
    }

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }

    const orderTotal = calculateCart(cart).cartTotal;
    const orderItems = [...cart.items];

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();

    await writeData('products.json', products);
    await writeData('carts.json', carts);

    res.json({
      message: 'Checkout successful',
      order: {
        userId: req.session.user.id,
        items: orderItems,
        total: orderTotal,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  removeItem,
  checkout
};

const { readData, writeData } = require('../utils/fileHelper');

const calculateCart = (cart) => {
  const items = cart.items.map((item) => ({
    ...item,
    itemTotal: item.unitPrice * item.quantity
  }));

  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const discount = subtotal >= 5000 ? Math.round(subtotal * 0.10) : 0;
  const cartTotal = subtotal - discount;

  return { items, subtotal, discount, cartTotal };
};

const getOrCreateCart = async (userId) => {
  const carts = await readData('carts.json');
  let cart = carts.find((item) => item.userId === userId);

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

const getCart = async (req, res) => {
  try {
    const { cart } = await getOrCreateCart(req.session.user.id);
    const calculated = calculateCart(cart);

    return res.status(200).json({
      success: true,
      cart: {
        userId: cart.userId,
        items: calculated.items,
        subtotal: calculated.subtotal,
        discount: calculated.discount,
        cartTotal: calculated.cartTotal,
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'productId and a positive integer quantity are required.'
      });
    }

    const products = await readData('products.json');
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { carts, cart } = await getOrCreateCart(req.session.user.id);
    const existingItem = cart.items.find((item) => item.productId === productId);
    const requestedTotalQuantity = (existingItem ? existingItem.quantity : 0) + quantity;

    if (product.stock < requestedTotalQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock.',
        availableStock: product.stock,
        requestedQuantity: requestedTotalQuantity
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.unitPrice = product.price;
      existingItem.name = product.name;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity
      });
    }

    const calculated = calculateCart(cart);
    cart.items = calculated.items;
    cart.cartTotal = calculated.cartTotal;
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      cart
    });
  } catch (error) {
    console.error('Add cart item error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const removeItem = async (req, res) => {
  try {
    const { carts, cart } = await getOrCreateCart(req.session.user.id);
    const index = cart.items.findIndex((item) => item.productId === req.params.productId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product is not in the cart.' });
    }

    cart.items.splice(index, 1);
    const calculated = calculateCart(cart);
    cart.items = calculated.items;
    cart.cartTotal = calculated.cartTotal;
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const checkout = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find((item) => item.userId === req.session.user.id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot checkout an empty cart.' });
    }

    const products = await readData('products.json');

    for (const item of cart.items) {
      const product = products.find((productItem) => productItem.id === item.productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} no longer exists.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
          availableStock: product.stock,
          requestedQuantity: item.quantity
        });
      }
    }

    for (const item of cart.items) {
      const product = products.find((productItem) => productItem.id === item.productId);
      product.stock -= item.quantity;
    }

    await writeData('products.json', products);

    const calculated = calculateCart(cart);
    const order = {
      orderId: `ord_${Date.now()}`,
      userId: cart.userId,
      items: calculated.items,
      subtotal: calculated.subtotal,
      discount: calculated.discount,
      total: calculated.cartTotal,
      placedAt: new Date().toISOString()
    };

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Checkout successful. Stock has been updated.',
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getCart, addItem, removeItem, checkout };

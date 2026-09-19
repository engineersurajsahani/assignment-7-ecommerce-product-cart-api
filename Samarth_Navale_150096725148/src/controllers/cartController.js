const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const carts = await readData('carts.json');
    let cart = carts.find((c) => c.userId === uid);

    if (!cart) {
      cart = {
        userId: uid,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
    }

    return res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

const addItemToCart = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const products = await readData('products.json');
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const carts = await readData('carts.json');
    let idx = carts.findIndex((c) => c.userId === uid);

    let cart;
    if (idx === -1) {
      cart = {
        userId: uid,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(cart);
      idx = carts.length - 1;
    } else {
      cart = carts[idx];
    }

    const existing = cart.items.find((i) => i.productId === productId);
    const currQty = existing ? existing.quantity : 0;
    const totalQty = currQty + qty;

    if (prod.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    if (totalQty > prod.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${prod.stock} available (${currQty} already in cart)`
      });
    }

    if (existing) {
      existing.quantity = totalQty;
      existing.unitPrice = prod.price;
      existing.itemTotal = totalQty * prod.price;
    } else {
      cart.items.push({
        productId: prod.id,
        name: prod.name,
        unitPrice: prod.price,
        quantity: qty,
        itemTotal: qty * prod.price
      });
    }

    cart.cartTotal = cart.items.reduce((sum, i) => sum + i.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    carts[idx] = cart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

const removeItemFromCart = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const { productId } = req.params;

    const carts = await readData('carts.json');
    const idx = carts.findIndex((c) => c.userId === uid);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cart = carts[idx];
    const itemIdx = cart.items.findIndex((i) => i.productId === productId);

    if (itemIdx === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items.splice(itemIdx, 1);
    cart.cartTotal = cart.items.reduce((sum, i) => sum + i.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    carts[idx] = cart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

const checkout = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const carts = await readData('carts.json');
    const idx = carts.findIndex((c) => c.userId === uid);

    if (idx === -1 || !carts[idx].items || carts[idx].items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot checkout an empty cart' });
    }

    const cart = carts[idx];
    const products = await readData('products.json');

    for (const item of cart.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`
        });
      }
    }

    for (const item of cart.items) {
      const prod = products.find((p) => p.id === item.productId);
      prod.stock -= item.quantity;
    }

    await writeData('products.json', products);

    const order = {
      orderId: `ord_${uuidv4().slice(0, 8)}`,
      userId: uid,
      items: [...cart.items],
      totalAmount: cart.cartTotal,
      placedAt: new Date().toISOString()
    };

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();

    carts[idx] = cart;
    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Order placed successfully! Checkout complete.',
      order
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  checkout
};

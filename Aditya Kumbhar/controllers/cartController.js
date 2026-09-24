const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getCart = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const userCart = carts.find(c => c.userId === req.session.user.id);

    if (!userCart) {
      return res.status(200).json({
        userId: req.session.user.id,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      });
    }

    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = quantity ? Number(quantity) : 1;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
    }

    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const carts = await readData('carts.json');
    let cartIndex = carts.findIndex(c => c.userId === req.session.user.id);

    let userCart;
    if (cartIndex === -1) {
      userCart = {
        userId: req.session.user.id,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(userCart);
      cartIndex = carts.length - 1;
    } else {
      userCart = carts[cartIndex];
    }

    const itemIndex = userCart.items.findIndex(i => i.productId === productId);
    const currentQtyInCart = itemIndex !== -1 ? userCart.items[itemIndex].quantity : 0;
    const totalRequiredQty = currentQtyInCart + qty;

    if (totalRequiredQty > product.stock) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${product.stock} units available, and you have ${currentQtyInCart} in your cart.`
      });
    }

    if (itemIndex !== -1) {
      userCart.items[itemIndex].quantity = totalRequiredQty;
      userCart.items[itemIndex].unitPrice = product.price;
      userCart.items[itemIndex].itemTotal = totalRequiredQty * product.price;
    } else {
      userCart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        itemTotal: qty * product.price
      });
    }

    userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData('carts.json', carts);

    res.status(200).json({
      message: 'Item added to cart successfully',
      cart: userCart
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === req.session.user.id);

    if (cartIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    const userCart = carts[cartIndex];
    const itemIndex = userCart.items.findIndex(i => i.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    userCart.items.splice(itemIndex, 1);
    userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData('carts.json', carts);

    res.status(200).json({
      message: 'Item removed from cart successfully',
      cart: userCart
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const checkout = async (req, res) => {
  try {
    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === req.session.user.id);

    if (cartIndex === -1 || carts[cartIndex].items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Cannot proceed to checkout.' });
    }

    const userCart = carts[cartIndex];
    const products = await readData('products.json');

    for (const item of userCart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          message: `Product "${item.name}" no longer exists.`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, in cart: ${item.quantity}.`
        });
      }
    }

    for (const item of userCart.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
      }
    }

    await writeData('products.json', products);

    const order = {
      orderId: 'ord_' + uuidv4().slice(0, 8),
      userId: req.session.user.id,
      customerEmail: req.session.user.email,
      items: [...userCart.items],
      totalAmount: userCart.cartTotal,
      status: 'Completed',
      orderDate: new Date().toISOString()
    };

    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData('carts.json', carts);

    res.status(200).json({
      message: 'Checkout successful. Order placed!',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  checkout
};

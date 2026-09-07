const { readData, writeData } = require('../utils/fileHelper');

const calculateCartTotal = (items) =>
  items.reduce((total, item) => total + item.itemTotal, 0);

const getCartForUser = async (userId) => {
  const carts = await readData('carts.json');
  return carts.find((cart) => cart.userId === userId);
};

const getCart = async (req, res, next) => {
  try {
    const cart = await getCartForUser(req.session.user.id);

    return res.status(200).json({
      success: true,
      cart: cart || {
        userId: req.session.user.id,
        items: [],
        cartTotal: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
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
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const carts = await readData('carts.json');
    let cart = carts.find((item) => item.userId === req.session.user.id);

    if (!cart) {
      cart = {
        userId: req.session.user.id,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(cart);
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    const existingQuantity = existingItem ? existingItem.quantity : 0;
    const requestedTotalQuantity = existingQuantity + quantity;

    if (requestedTotalQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock.',
        availableStock: product.stock,
        requestedQuantity: requestedTotalQuantity
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotalQuantity;
      existingItem.unitPrice = product.price;
      existingItem.name = product.name;
      existingItem.itemTotal = product.price * existingItem.quantity;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        itemTotal: product.price * quantity
      });
    }

    cart.cartTotal = calculateCartTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const carts = await readData('carts.json');
    const cart = carts.find((item) => item.userId === req.session.user.id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in the cart.'
      });
    }

    const [removedItem] = cart.items.splice(itemIndex, 1);
    cart.cartTotal = calculateCartTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
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

    const cart = carts.find((item) => item.userId === req.session.user.id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Empty cart.'
      });
    }

    // Re-check stock at checkout time.
    for (const cartItem of cart.items) {
      const product = products.find((item) => item.id === cartItem.productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${cartItem.productId} no longer exists.`
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
          availableStock: product.stock,
          requestedQuantity: cartItem.quantity
        });
      }
    }

    // Decrement stock after all items pass validation.
    for (const cartItem of cart.items) {
      const product = products.find((item) => item.id === cartItem.productId);
      product.stock -= cartItem.quantity;
    }

    const order = {
      orderId: `ord_${Date.now()}`,
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

    return res.status(200).json({
      success: true,
      message: 'Checkout successful. Order placed.',
      order
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

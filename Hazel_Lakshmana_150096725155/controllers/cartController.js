const { readData, writeData } = require('../utils/fileHelper');

const calculateCartTotal = (items) => {
  return items.reduce(
    (total, item) => total + item.itemTotal,
    0
  );
};

const getCart = async (req, res) => {
  try {
    const carts = await readData('carts.json');

    const cart = carts.find(
      (item) => item.userId === req.session.user.id
    );

    if (!cart) {
      return res.status(200).json({
        userId: req.session.user.id,
        items: [],
        cartTotal: 0
      });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching cart.',
      error: error.message
    });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: 'productId and quantity are required.'
      });
    }

    if (
      typeof quantity !== 'number' ||
      quantity <= 0 ||
      !Number.isInteger(quantity)
    ) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer.'
      });
    }

    const products = await readData('products.json');

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const carts = await readData('carts.json');

    let cartIndex = carts.findIndex(
      (item) => item.userId === req.session.user.id
    );

    if (cartIndex === -1) {
      carts.push({
        userId: req.session.user.id,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      });

      cartIndex = carts.length - 1;
    }

    const cart = carts[cartIndex];

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    const currentQuantity =
      existingItemIndex === -1
        ? 0
        : cart.items[existingItemIndex].quantity;

    const requestedQuantity = currentQuantity + quantity;

    if (requestedQuantity > product.stock) {
      return res.status(400).json({
        message: 'Insufficient stock.',
        availableStock: product.stock,
        requestedQuantity
      });
    }

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity = requestedQuantity;
      cart.items[existingItemIndex].itemTotal =
        product.price * requestedQuantity;
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
      message: 'Item added to cart successfully.',
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while adding item to cart.',
      error: error.message
    });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const carts = await readData('carts.json');

    const cartIndex = carts.findIndex(
      (item) => item.userId === req.session.user.id
    );

    if (cartIndex === -1) {
      return res.status(404).json({
        message: 'Cart not found.'
      });
    }

    const cart = carts[cartIndex];

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: 'Product is not present in cart.'
      });
    }

    cart.items.splice(itemIndex, 1);
    cart.cartTotal = calculateCartTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({
      message: 'Item removed from cart successfully.',
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while removing item from cart.',
      error: error.message
    });
  }
};

const checkout = async (req, res) => {
  try {
    const carts = await readData('carts.json');

    const cartIndex = carts.findIndex(
      (item) => item.userId === req.session.user.id
    );

    if (
      cartIndex === -1 ||
      carts[cartIndex].items.length === 0
    ) {
      return res.status(400).json({
        message: 'Cart is empty.'
      });
    }

    const cart = carts[cartIndex];
    const products = await readData('products.json');

    for (const cartItem of cart.items) {
      const product = products.find(
        (item) => item.id === cartItem.productId
      );

      if (!product) {
        return res.status(404).json({
          message: `Product ${cartItem.productId} no longer exists.`
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}.`,
          availableStock: product.stock,
          requestedQuantity: cartItem.quantity
        });
      }
    }

    for (const cartItem of cart.items) {
      const product = products.find(
        (item) => item.id === cartItem.productId
      );

      product.stock -= cartItem.quantity;
    }

    await writeData('products.json', products);

    const orderSummary = {
      userId: req.session.user.id,
      items: cart.items,
      totalPaid: cart.cartTotal,
      checkedOutAt: new Date().toISOString()
    };

    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    return res.status(200).json({
      message: 'Checkout successful.',
      order: orderSummary
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error during checkout.',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  checkout
};

const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData(CARTS_FILE);

    let userCart = carts.find((c) => c.userId === userId);

    if (!userCart) {
      userCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: null
      };
    } else {
      userCart.items = userCart.items.map((item) => ({
        ...item,
        itemTotal: item.unitPrice * item.quantity
      }));
      userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    }

    return res.status(200).json({
      success: true,
      data: userCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cart.'
    });
  }
};


const addToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: productId is required.'
      });
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: quantity must be a positive integer greater than 0.'
      });
    }

    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' not found.`
      });
    }

    const carts = await readData(CARTS_FILE);
    let cartIndex = carts.findIndex((c) => c.userId === userId);

    let userCart;
    if (cartIndex === -1) {
      userCart = {
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      };
      carts.push(userCart);
      cartIndex = carts.length - 1;
    } else {
      userCart = carts[cartIndex];
    }

    const existingItem = userCart.items.find((item) => item.productId === productId);
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    const totalRequestedQty = currentCartQty + parsedQty;

    if (totalRequestedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${product.stock}, currently in cart: ${currentCartQty}, requested additional: ${parsedQty}.`
      });
    }

    if (existingItem) {
      existingItem.quantity = totalRequestedQty;
      existingItem.unitPrice = product.price;
      existingItem.itemTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      userCart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: parsedQty,
        itemTotal: product.price * parsedQty
      });
    }

    userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: `Product '${product.name}' added to cart successfully.`,
      data: userCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding item to cart.'
    });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData(CARTS_FILE);
    const cartIndex = carts.findIndex((c) => c.userId === userId);

    if (cartIndex === -1 || !carts[cartIndex].items || carts[cartIndex].items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty or does not exist.'
      });
    }

    const userCart = carts[cartIndex];
    const itemIndex = userCart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' is not in your cart.`
      });
    }

    const removedItem = userCart.items.splice(itemIndex, 1)[0];

    userCart.cartTotal = userCart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: `Item '${removedItem.name}' removed from cart.`,
      data: userCart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing item from cart.'
    });
  }
};


const checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const carts = await readData(CARTS_FILE);
    const cartIndex = carts.findIndex((c) => c.userId === userId);

    if (cartIndex === -1 || !carts[cartIndex].items || carts[cartIndex].items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Empty Cart: Cannot checkout an empty cart.'
      });
    }

    const userCart = carts[cartIndex];
    const products = await readData(PRODUCTS_FILE);

    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Checkout failed: Product '${item.name}' (ID: ${item.productId}) no longer exists.`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Checkout failed: Insufficient stock for '${product.name}'. In stock: ${product.stock}, required: ${item.quantity}.`
        });
      }
    }

    for (const item of userCart.items) {
      const product = products.find((p) => p.id === item.productId);
      product.stock -= item.quantity;
    }

    await writeData(PRODUCTS_FILE, products);

    const orderReceipt = {
      orderId: `ord_${uuidv4().substring(0, 8)}`,
      userId,
      purchasedItems: [...userCart.items],
      totalAmountPaid: userCart.cartTotal,
      orderDate: new Date().toISOString(),
      orderStatus: 'Confirmed'
    };

    userCart.items = [];
    userCart.cartTotal = 0;
    userCart.updatedAt = new Date().toISOString();

    carts[cartIndex] = userCart;
    await writeData(CARTS_FILE, carts);

    return res.status(200).json({
      success: true,
      message: 'Checkout successful! Order placed and inventory updated.',
      order: orderReceipt
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during checkout.'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  checkout
};

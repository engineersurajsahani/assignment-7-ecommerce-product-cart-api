const { readData, writeData } = require('../utils/fileHelper');

exports.getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
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

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;

    if (!productId || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid productId and positive quantity are required'
      });
    }

    const products = await readData('products.json');
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const carts = await readData('carts.json');
    let cartIndex = carts.findIndex(c => c.userId === userId);

    if (cartIndex === -1) {
      carts.push({
        userId,
        items: [],
        cartTotal: 0,
        updatedAt: new Date().toISOString()
      });
      cartIndex = carts.length - 1;
    }

    const cart = carts[cartIndex];
    const existingItem = cart.items.find(i => i.productId === productId);
    const existingQty = existingItem ? existingItem.quantity : 0;
    const requestedTotalQty = existingQty + qty;

    if (product.stock < requestedTotalQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Requested: ${requestedTotalQty}, Available: ${product.stock}`
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotalQty;
      existingItem.itemTotal = existingItem.quantity * product.price;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        itemTotal: qty * product.price
      });
    }

    cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.params;

    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === userId);

    if (cartIndex === -1) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cart = carts[cartIndex];
    const itemIndex = cart.items.findIndex(i => i.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    cart.cartTotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    cart.updatedAt = new Date().toISOString();

    await writeData('carts.json', carts);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const carts = await readData('carts.json');
    const cartIndex = carts.findIndex(c => c.userId === userId);

    if (cartIndex === -1 || carts[cartIndex].items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot checkout with an empty cart'
      });
    }

    const cart = carts[cartIndex];
    const products = await readData('products.json');

    // Validate stock
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot checkout. Product "${item.name}" has insufficient stock.`
        });
      }
    }

    // Decrement stock
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    await writeData('products.json', products);

    const orderSummary = {
      orderId: `ord_${Date.now()}`,
      userId,
      items: [...cart.items],
      totalPaid: cart.cartTotal,
      orderDate: new Date().toISOString()
    };

    // Clear cart
    cart.items = [];
    cart.cartTotal = 0;
    cart.updatedAt = new Date().toISOString();
    await writeData('carts.json', carts);

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      data: orderSummary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

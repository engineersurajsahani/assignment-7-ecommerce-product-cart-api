const { v4: uuidv4 } = require("uuid");
const { readData, writeData, withLock } = require("../utils/fileHelper");

const PRODUCTS_FILE = "products.json";
const CARTS_FILE = "carts.json";
const ORDERS_FILE = "orders.json";

// 10% off when the cart subtotal reaches this amount
const DISCOUNT_THRESHOLD = 5000;
const DISCOUNT_RATE = 0.1;

// round to 2 decimals so 0.1 + 0.2 style float noise never shows up in totals
function round(value) {
  return Math.round(value * 100) / 100;
}

// Recompute itemTotal / cartTotal from quantity * unitPrice. Totals are never
// trusted from the file or the client -- always calculated here.
function recalculate(cart) {
  cart.items.forEach((item) => {
    item.itemTotal = round(item.unitPrice * item.quantity);
  });
  cart.cartTotal = round(cart.items.reduce((sum, item) => sum + item.itemTotal, 0));
  cart.updatedAt = new Date().toISOString();
  return cart;
}

// What the API sends back: the stored cart plus the discount breakdown.
function summary(cart) {
  const discount =
    cart.cartTotal >= DISCOUNT_THRESHOLD ? round(cart.cartTotal * DISCOUNT_RATE) : 0;
  return {
    ...cart,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    discount,
    payable: round(cart.cartTotal - discount),
  };
}

function emptyCart(userId) {
  return { userId, items: [], cartTotal: 0, updatedAt: new Date().toISOString() };
}

async function getCart(request, response) {
  try {
    const carts = await readData(CARTS_FILE);
    const cart =
      carts.find((c) => c.userId === request.session.user.id) ||
      emptyCart(request.session.user.id);
    return response.status(200).json({ cart: summary(cart) });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

// POST /api/cart/items { productId, quantity }
// Quantity is ADDED to what is already in the cart, and the new total may not
// be more than the product's stock.
async function addItem(request, response) {
  try {
    const productId = String(request.body.productId ?? "").trim();
    const quantity = Number(request.body.quantity ?? 1);

    if (!productId) {
      return response.status(400).json({ message: "productId is required" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return response
        .status(400)
        .json({ message: "quantity must be a whole number of at least 1" });
    }

    const userId = request.session.user.id;

    // Read products + carts and write carts inside ONE lock, so a checkout
    // cannot change the stock between our check and our write.
    const result = await withLock(async () => {
      const products = await readData(PRODUCTS_FILE);
      const product = products.find((p) => p.id === productId);
      if (!product) {
        return { status: 404, message: "Product not found" };
      }

      const carts = await readData(CARTS_FILE);
      let cart = carts.find((c) => c.userId === userId);
      if (!cart) {
        cart = emptyCart(userId);
        carts.push(cart);
      }

      if (product.stock === 0) {
        return { status: 400, message: "Out of stock" };
      }

      const existing = cart.items.find((item) => item.productId === productId);
      const alreadyInCart = existing ? existing.quantity : 0;

      if (alreadyInCart + quantity > product.stock) {
        return {
          status: 400,
          message: `Insufficient stock: only ${product.stock} available, you already have ${alreadyInCart} in cart`,
        };
      }

      if (existing) {
        existing.quantity += quantity;
        existing.unitPrice = product.price; // keep the price current
        existing.name = product.name;
      } else {
        cart.items.push({
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity,
          itemTotal: 0, // filled in by recalculate
        });
      }

      recalculate(cart);
      await writeData(CARTS_FILE, carts);
      return { status: 200, cart };
    });

    if (result.status !== 200) {
      return response.status(result.status).json({ message: result.message });
    }
    return response
      .status(200)
      .json({ message: "Item added to cart", cart: summary(result.cart) });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

async function removeItem(request, response) {
  try {
    const userId = request.session.user.id;
    const { productId } = request.params;

    const cart = await withLock(async () => {
      const carts = await readData(CARTS_FILE);
      const found = carts.find((c) => c.userId === userId);
      if (!found || !found.items.some((item) => item.productId === productId)) {
        return null;
      }
      found.items = found.items.filter((item) => item.productId !== productId);
      recalculate(found);
      await writeData(CARTS_FILE, carts);
      return found;
    });

    if (!cart) {
      return response.status(404).json({ message: "Product not in cart" });
    }
    return response
      .status(200)
      .json({ message: "Item removed from cart", cart: summary(cart) });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

// Simulated order: re-check every item against CURRENT stock, then decrement
// stock in products.json, save the order, and empty the cart. Either every
// item passes or nothing is changed.
async function checkout(request, response) {
  try {
    const userId = request.session.user.id;

    const result = await withLock(async () => {
      const carts = await readData(CARTS_FILE);
      const cart = carts.find((c) => c.userId === userId);
      if (!cart || cart.items.length === 0) {
        return { status: 400, message: "Cart is empty" };
      }

      const products = await readData(PRODUCTS_FILE);

      // pass 1: validate everything before touching anything
      const problems = [];
      for (const item of cart.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          problems.push(`${item.name} is no longer sold`);
        } else if (product.stock < item.quantity) {
          problems.push(`${item.name}: only ${product.stock} left, cart has ${item.quantity}`);
        }
      }
      if (problems.length > 0) {
        return { status: 400, message: `Checkout failed: ${problems.join("; ")}` };
      }

      // pass 2: decrement stock and charge today's price
      for (const item of cart.items) {
        const product = products.find((p) => p.id === item.productId);
        product.stock -= item.quantity;
        item.unitPrice = product.price;
      }
      recalculate(cart);
      const totals = summary(cart);

      const order = {
        orderId: `ord_${uuidv4().slice(0, 8)}`,
        userId,
        items: cart.items,
        cartTotal: totals.cartTotal,
        discount: totals.discount,
        payable: totals.payable,
        placedAt: new Date().toISOString(),
      };

      const orders = await readData(ORDERS_FILE);
      orders.push(order);

      cart.items = [];
      recalculate(cart);

      await writeData(PRODUCTS_FILE, products);
      await writeData(ORDERS_FILE, orders);
      await writeData(CARTS_FILE, carts);
      return { status: 200, order };
    });

    if (result.status !== 200) {
      return response.status(result.status).json({ message: result.message });
    }
    return response
      .status(200)
      .json({ message: "Order placed successfully", order: result.order });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

// the logged-in user's past orders
async function getOrders(request, response) {
  try {
    const orders = await readData(ORDERS_FILE);
    const mine = orders
      .filter((o) => o.userId === request.session.user.id)
      .reverse(); // newest first
    return response.status(200).json({ count: mine.length, orders: mine });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

module.exports = { getCart, addItem, removeItem, checkout, getOrders };

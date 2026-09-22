const { readData, writeData } = require("../config/db");

const CARTS_FILE = "carts.json";

const getAllCarts = async () => {
  return await readData(CARTS_FILE);
};

const getCartByUserId = async (userId) => {
  const carts = await getAllCarts();
  const userCart = carts.find((cart) => cart.userId === userId);

  if (!userCart) {
    return {
      userId,
      items: [],
      cartTotal: 0,
      updatedAt: new Date().toISOString()
    };
  }

  return userCart;
};

const saveCart = async (cartToSave) => {
  const carts = await getAllCarts();
  const index = carts.findIndex((c) => c.userId === cartToSave.userId);

  cartToSave.updatedAt = new Date().toISOString();

  if (index !== -1) {
    carts[index] = cartToSave;
  } else {
    carts.push(cartToSave);
  }

  await writeData(CARTS_FILE, carts);
  return cartToSave;
};

const clearCart = async (userId) => {
  const cart = await getCartByUserId(userId);
  cart.items = [];
  cart.cartTotal = 0;
  cart.updatedAt = new Date().toISOString();

  await saveCart(cart);
  return cart;
};

module.exports = {
  getCartByUserId,
  saveCart,
  clearCart
};

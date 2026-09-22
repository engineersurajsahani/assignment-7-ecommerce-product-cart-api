const { readData, writeData } = require("../config/db");

const PRODUCTS_FILE = "products.json";

const getAllProducts = async (query = {}) => {
  let products = await readData(PRODUCTS_FILE);

  const { category, minPrice, maxPrice, search, inStock, sort } = query;

  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice !== undefined && minPrice !== "") {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      products = products.filter((p) => p.price >= min);
    }
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      products = products.filter((p) => p.price <= max);
    }
  }

  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(searchLower)
    );
  }

  if (inStock === "true" || inStock === true) {
    products = products.filter((p) => p.stock > 0);
  }

  if (sort) {
    if (sort === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === "rating_desc") {
      products.sort((a, b) => b.rating - a.rating);
    }
  }

  return products;
};

const getProductById = async (id) => {
  const products = await readData(PRODUCTS_FILE);
  return products.find((p) => p.id === id);
};

const createProduct = async (newProduct) => {
  const products = await readData(PRODUCTS_FILE);
  products.push(newProduct);
  await writeData(PRODUCTS_FILE, products);
  return newProduct;
};

const updateProduct = async (id, updateData) => {
  const products = await readData(PRODUCTS_FILE);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  const updatedProduct = {
    ...products[index],
    ...updateData,
    id
  };

  products[index] = updatedProduct;
  await writeData(PRODUCTS_FILE, products);
  return updatedProduct;
};

const deleteProduct = async (id) => {
  const products = await readData(PRODUCTS_FILE);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return false;
  }

  products.splice(index, 1);
  await writeData(PRODUCTS_FILE, products);
  return true;
};

const saveAllProducts = async (products) => {
  await writeData(PRODUCTS_FILE, products);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  saveAllProducts
};

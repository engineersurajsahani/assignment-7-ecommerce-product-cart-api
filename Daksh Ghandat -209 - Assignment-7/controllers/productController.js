const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';

const SUPPORTED_SORTS = ['price_asc', 'price_desc', 'rating_desc', 'name_asc', 'newest'];

const getProducts = async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    search,
    sort,
  } = req.query;

  let products = await readData(PRODUCTS_FILE);

  // --- Category filtering (case-insensitive) ---
  if (category) {
    products = products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // --- Price lower bound ---
  if (minPrice !== undefined) {
    const min = Number(minPrice);
    if (!Number.isFinite(min)) {
      return res.status(400).json({ message: 'minPrice must be a valid number' });
    }
    products = products.filter((product) => product.price >= min);
  }

  // --- Price upper bound ---
  if (maxPrice !== undefined) {
    const max = Number(maxPrice);
    if (!Number.isFinite(max)) {
      return res.status(400).json({ message: 'maxPrice must be a valid number' });
    }
    products = products.filter((product) => product.price <= max);
  }

  // --- In-stock filter ---
  if (inStock === 'true') {
    products = products.filter((product) => product.stock > 0);
  } else if (inStock === 'false') {
    products = products.filter((product) => product.stock === 0);
  }

  // --- Search by name (and category) ---
  if (search) {
    const term = search.toLowerCase();
    products = products.filter((product) => {
      const inName = product.name.toLowerCase().includes(term);
      const inCategory = product.category.toLowerCase().includes(term);
      return inName || inCategory;
    });
  }

  // --- Sorting ---
  if (sort) {
    if (!SUPPORTED_SORTS.includes(sort)) {
      return res.status(400).json({ message: 'Unsupported sort value' });
    }

    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
  }

  return res.status(200).json({
    count: products.length,
    products,
  });
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  const products = await readData(PRODUCTS_FILE);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json(product);
};

const addProduct = async (req, res) => {
  const { name, category, price, stock = 0, rating = 0 } = req.body;

  const newProduct = {
    id: `prod_${uuidv4()}`,
    name: name.trim(),
    category: category.trim(),
    price,
    stock,
    rating,
    createdAt: new Date().toISOString(),
  };

  const products = await readData(PRODUCTS_FILE);
  products.push(newProduct);
  await writeData(PRODUCTS_FILE, products);

  return res.status(201).json(newProduct);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, rating } = req.body;

  const products = await readData(PRODUCTS_FILE);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Only update the fields that were supplied. ID and createdAt stay unchanged.
  if (name !== undefined) {
    product.name = name.trim();
  }
  if (category !== undefined) {
    product.category = category.trim();
  }
  if (price !== undefined) {
    product.price = price;
  }
  if (stock !== undefined) {
    product.stock = stock;
  }
  if (rating !== undefined) {
    product.rating = rating;
  }

  await writeData(PRODUCTS_FILE, products);

  return res.status(200).json(product);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const products = await readData(PRODUCTS_FILE);
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(productIndex, 1);
  await writeData(PRODUCTS_FILE, products);

  return res.status(200).json({ message: 'Product deleted successfully' });
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
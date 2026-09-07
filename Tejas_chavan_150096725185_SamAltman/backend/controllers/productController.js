// controllers/productController.js
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';

const SORT_STRATEGIES = {
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  rating_asc: (a, b) => a.rating - b.rating,
  rating_desc: (a, b) => b.rating - a.rating,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
};

/**
 * GET /api/products
 * Query params:
 *   category  - exact match, case-insensitive
 *   minPrice  - inclusive lower bound
 *   maxPrice  - inclusive upper bound
 *   inStock   - "true" -> stock > 0 only
 *   search    - case-insensitive substring match on product name
 *   sort      - price_asc | price_desc | rating_asc | rating_desc | newest | oldest
 */
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, search, sort } = req.query;

    let products = await readData(PRODUCTS_FILE);

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) {
        products = products.filter((p) => p.price >= min);
      }
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) {
        products = products.filter((p) => p.price <= max);
      }
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.stock > 0);
    }

    if (search) {
      const needle = String(search).toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(needle));
    }

    if (sort && SORT_STRATEGIES[sort]) {
      products = [...products].sort(SORT_STRATEGIES[sort]);
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('[productController.getProducts]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('[productController.getProductById]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/products  (Admin route — validateProduct middleware runs first)
 */
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;

    const products = await readData(PRODUCTS_FILE);

    const newProduct = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating !== undefined ? Number(rating) : 0,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct,
    });
  } catch (error) {
    console.error('[productController.createProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/products/:id  (validateProduct middleware runs first)
 */
const updateProduct = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { name, category, price, stock, rating } = req.body;
    const existing = products[index];

    const updated = {
      ...existing,
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(rating !== undefined && { rating: Number(rating) }),
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('[productController.updateProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const [removed] = products.splice(index, 1);
    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      success: true,
      message: 'Product removed successfully.',
      data: removed,
    });
  } catch (error) {
    console.error('[productController.deleteProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

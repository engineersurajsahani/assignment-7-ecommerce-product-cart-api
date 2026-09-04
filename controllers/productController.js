const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

/**
 * Get all products with multi-criteria filtering and sorting
 * GET /api/products
 * Query Params: category, minPrice, maxPrice, inStock, search, sort
 */
const getAllProducts = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    let results = [...products];

    const { category, minPrice, maxPrice, inStock, search, sort } = req.query;

    // Filter by Category (case-insensitive)
    if (category) {
      results = results.filter(
        (p) => p.category && p.category.toLowerCase() === category.trim().toLowerCase()
      );
    }

    // Filter by Minimum Price
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      results = results.filter((p) => p.price >= Number(minPrice));
    }

    // Filter by Maximum Price
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      results = results.filter((p) => p.price <= Number(maxPrice));
    }

    // Filter by Stock Status (inStock=true/false)
    if (inStock !== undefined) {
      const isInStock = inStock.toLowerCase() === 'true' || inStock === '1';
      if (isInStock) {
        results = results.filter((p) => p.stock > 0);
      } else {
        results = results.filter((p) => p.stock === 0);
      }
    }

    // Filter by Search Query (Product Name or Category)
    if (search) {
      const query = search.toLowerCase();
      results = results.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    }

    // Sorting Logic
    if (sort) {
      switch (sort.toLowerCase()) {
        case 'price_asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating_desc':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'rating_asc':
          results.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        case 'newest':
          results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'name_asc':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          results.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      products: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readData('products.json');
    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new product
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData('products.json');

    const newProduct = {
      id: `prod_${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating !== undefined ? Number(rating) : 0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData('products.json', products);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readData('products.json');
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found.`
      });
    }

    const { name, category, price, stock, rating } = req.body;
    const existing = products[productIndex];

    const updatedProduct = {
      ...existing,
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(rating !== undefined && { rating: Number(rating) }),
      updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;
    await writeData('products.json', products);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readData('products.json');
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found.`
      });
    }

    products.splice(productIndex, 1);
    await writeData('products.json', products);

    return res.status(200).json({
      success: true,
      message: `Product with ID '${id}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

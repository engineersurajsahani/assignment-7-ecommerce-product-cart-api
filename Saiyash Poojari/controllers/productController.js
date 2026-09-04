const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';

/**
 * @route GET /api/products
 * @desc Filter & search products (category, minPrice, maxPrice, sort)
 */
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, search } = req.query;

    let products = await readData(PRODUCTS_FILE);

    // Filtering by category (case-insensitive)
    if (category) {
      products = products.filter(p => 
        p.category.toLowerCase() === category.toString().toLowerCase()
      );
    }

    // Filtering by search term in name or category
    if (search) {
      const term = search.toString().toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
      );
    }

    // Filtering by minPrice
    if (minPrice !== undefined && !isNaN(parseFloat(minPrice))) {
      const min = parseFloat(minPrice);
      products = products.filter(p => p.price >= min);
    }

    // Filtering by maxPrice
    if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
      const max = parseFloat(maxPrice);
      products = products.filter(p => p.price <= max);
    }

    // Sorting
    if (sort) {
      switch (sort.toString().toLowerCase()) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating_desc':
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'rating_asc':
          products.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }

    return res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch products.'
    });
  }
};

/**
 * @route GET /api/products/:id
 * @desc Fetch single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);

    const product = products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${id}' not found.`
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch product.'
    });
  }
};

/**
 * @route POST /api/products
 * @desc Add a new product (Admin route)
 */
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData(PRODUCTS_FILE);

    // Generate unique product ID
    let nextNum = 101;
    const existingIds = products.map(p => {
      const match = p.id.match(/^prod_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    if (existingIds.length > 0) {
      nextNum = Math.max(...existingIds) + 1;
    }
    const newId = `prod_${nextNum}`;

    const newProduct = {
      id: newId,
      name: name.trim(),
      category: category.trim(),
      price,
      stock,
      rating: rating !== undefined ? rating : 0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);

    return res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error in createProduct controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create product.'
    });
  }
};

/**
 * @route PUT /api/products/:id
 * @desc Update price or stock count or other product fields
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, rating } = req.body;

    const products = await readData(PRODUCTS_FILE);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${id}' not found.`
      });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(rating !== undefined && { rating }),
      updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;
    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error in updateProduct controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update product.'
    });
  }
};

/**
 * @route DELETE /api/products/:id
 * @desc Remove product from store
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);

    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${id}' not found.`
      });
    }

    const deletedProduct = products[productIndex];
    const updatedProducts = products.filter(p => p.id !== id);

    await writeData(PRODUCTS_FILE, updatedProducts);

    return res.status(200).json({
      message: 'Product deleted successfully',
      productId: id,
      deletedProduct
    });
  } catch (error) {
    console.error('Error in deleteProduct controller:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete product.'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

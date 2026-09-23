const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, search, sort } = req.query;
    let products = await readData('products.json');

    if (category) {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (!Number.isFinite(min)) {
        return res.status(400).json({ success: false, message: 'minPrice must be a valid number.' });
      }
      products = products.filter((product) => product.price >= min);
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);
      if (!Number.isFinite(max)) {
        return res.status(400).json({ success: false, message: 'maxPrice must be a valid number.' });
      }
      products = products.filter((product) => product.price <= max);
    }

    if (inStock !== undefined) {
      const value = String(inStock).toLowerCase();
      if (!['true', 'false'].includes(value)) {
        return res.status(400).json({ success: false, message: 'inStock must be true or false.' });
      }
      products = value === 'true'
        ? products.filter((product) => product.stock > 0)
        : products.filter((product) => product.stock === 0);
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
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case undefined:
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid sort. Use price_asc, price_desc, rating_desc or newest.'
        });
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');
    const product = products.find((item) => item.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;

    if (!name || !category || price === undefined || stock === undefined || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, category, price, stock and rating are required.'
      });
    }

    const products = await readData('products.json');
    const product = {
      id: `prod_${uuidv4().split('-')[0]}`,
      name: name.trim(),
      category: category.trim(),
      price,
      stock,
      rating,
      createdAt: new Date().toISOString()
    };

    products.push(product);
    await writeData('products.json', products);

    return res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const allowedFields = ['name', 'category', 'price', 'stock', 'rating'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'name' || field === 'category'
          ? req.body[field].trim()
          : req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Provide at least one field to update.' });
    }

    products[index] = { ...products[index], ...updates };
    await writeData('products.json', products);

    return res.status(200).json({
      success: true,
      message: 'Product updated.',
      product: products[index]
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const [deletedProduct] = products.splice(index, 1);
    await writeData('products.json', products);

    return res.status(200).json({
      success: true,
      message: 'Product deleted.',
      product: deletedProduct
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

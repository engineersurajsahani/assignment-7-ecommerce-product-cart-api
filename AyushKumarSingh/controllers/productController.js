
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';

const getProducts = async (req, res) => {
  try {
    let products = await readData(PRODUCTS_FILE);
    const { category, minPrice, maxPrice, inStock, sort, search } = req.query;

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(term));
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) products = products.filter((p) => p.price >= min);
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) products = products.filter((p) => p.price <= max);
    }

    if (inStock !== undefined) {
      const wantInStock = inStock === 'true';
      products = products.filter((p) => (wantInStock ? p.stock > 0 : p.stock === 0));
    }

    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating_asc':
        products.sort((a, b) => a.rating - b.rating);
        break;
      case 'rating_desc':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData(PRODUCTS_FILE);

    const newProduct = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name,
      category,
      price,
      stock,
      rating: rating !== undefined ? rating : 0,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allowedFields = ['name', 'category', 'price', 'stock', 'rating'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        products[index][field] = req.body[field];
      }
    });
    products[index].updatedAt = new Date().toISOString();

    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: products[index],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const [removed] = products.splice(index, 1);
    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      success: true,
      message: 'Product removed successfully',
      data: removed,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

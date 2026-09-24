const { readData, writeData } = require('../utils/fileHelper');
const { v4: uuidv4 } = require('uuid');

const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    let products = await readData('products.json');

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }
    if (sort) {
      if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      }
    }

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  const { name, category, price, stock, rating } = req.body;
  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const products = await readData('products.json');
    const newProduct = {
      id: `prod_${uuidv4()}`,
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      rating: rating ? parseFloat(rating) : 0,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await writeData('products.json', products);

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = req.body;
    products[index] = { ...products[index], ...updates };

    await writeData('products.json', products);
    res.status(200).json({ success: true, data: products[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    let products = await readData('products.json');
    const filtered = products.filter(p => p.id !== req.params.id);
    
    if (products.length === filtered.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await writeData('products.json', filtered);
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

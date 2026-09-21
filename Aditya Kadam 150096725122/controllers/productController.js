const { readData, writeData } = require('../utils/fileHelper');
const { v4: uuidv4 } = require('uuid');

const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    let products = await readData('products.json');
    
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (minPrice !== undefined) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice !== undefined) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    if (sort) {
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
        case 'createdAt_desc':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData('products.json');
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData('products.json');
    
    const newProduct = {
      id: `prod_${uuidv4().substring(0, 8)}`,
      name,
      category,
      price,
      stock,
      rating: rating || 0,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await writeData('products.json', products);
    
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const products = await readData('products.json');
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (updates.price !== undefined && updates.price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    if (updates.stock !== undefined && updates.stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }
    
    products[productIndex] = { ...products[productIndex], ...updates };
    await writeData('products.json', products);
    
    res.status(200).json({ message: 'Product updated successfully', product: products[productIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData('products.json');
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    products.splice(productIndex, 1);
    await writeData('products.json', products);
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct };

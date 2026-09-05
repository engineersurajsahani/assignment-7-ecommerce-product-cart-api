const { readData, writeData } = require('../utils/fileHelper');
const { v4: uuidv4 } = require('uuid');

const getProducts = async (req, res) => {
  try {
    const products = await readData('products.json');
    let filteredProducts = [...products];

    // Filtering
    const { category, minPrice, maxPrice, sort } = req.query;

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    res.status(200).json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
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
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData('products.json');

    const newProduct = {
      id: `prod_${uuidv4()}`,
      name,
      category,
      price,
      stock,
      rating: rating || 0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData('products.json', products);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;
    
    const products = await readData('products.json');
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (price !== undefined) products[productIndex].price = price;
    if (stock !== undefined) products[productIndex].stock = stock;

    await writeData('products.json', products);

    res.status(200).json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let products = await readData('products.json');
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products = products.filter(p => p.id !== id);
    await writeData('products.json', products);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

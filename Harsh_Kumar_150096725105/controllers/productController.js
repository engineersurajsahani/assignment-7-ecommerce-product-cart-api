const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

exports.getProducts = async (req, res) => {
  try {
    let products = await readData('products.json');
    
    // Filtering
    const { category, minPrice, maxPrice, sort } = req.query;
    
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }
    
    // Sorting
    if (sort) {
      if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    if (!name || !category || price == null || stock == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const products = await readData('products.json');
    const newProduct = {
      id: `prod_${uuidv4()}`,
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      rating: rating ? Number(rating) : 0,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await writeData('products.json', products);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { price, stock } = req.body;
    const products = await readData('products.json');
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ message: 'Product not found' });
    
    if (price != null) products[index].price = Number(price);
    if (stock != null) products[index].stock = Number(stock);
    
    await writeData('products.json', products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    let products = await readData('products.json');
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ message: 'Product not found' });
    
    products.splice(index, 1);
    await writeData('products.json', products);
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getProducts = async (req, res) => {
  try {
    let products = await readData('products.json');
    const { category, minPrice, maxPrice, inStock, sort } = req.query;

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.stock > 0);
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
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }

    return res.status(200).json({ count: products.length, products });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;

    const products = await readData('products.json');

    const newProduct = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name,
      category,
      price,
      stock,
      rating: rating || 0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData('products.json', products);

    return res.status(201).json({ message: 'Product created', product: newProduct });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, category, price, stock, rating } = req.body;

    if (name !== undefined) products[index].name = name;
    if (category !== undefined) products[index].category = category;
    if (price !== undefined) products[index].price = price;
    if (stock !== undefined) products[index].stock = stock;
    if (rating !== undefined) products[index].rating = rating;

    await writeData('products.json', products);

    return res.status(200).json({ message: 'Product updated', product: products[index] });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const removed = products.splice(index, 1);
    await writeData('products.json', products);

    return res.status(200).json({ message: 'Product deleted', product: removed[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

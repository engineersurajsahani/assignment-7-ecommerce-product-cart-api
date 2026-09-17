const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getProducts = async (req, res) => {
  try {
    let products = await readData('products.json');

    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort
    } = req.query;

    if (category) {
      products = products.filter(
        product => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice !== undefined) {
      products = products.filter(product => product.price >= Number(minPrice));
    }

    if (maxPrice !== undefined) {
      products = products.filter(product => product.price <= Number(maxPrice));
    }

    if (inStock === 'true') {
      products = products.filter(product => product.stock > 0);
    }

    if (search) {
      const keyword = search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(keyword)
      );
    }

    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'name_asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');
    const product = products.find(item => item.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating = 0 } = req.body;

    if (price === undefined || stock === undefined) {
      return res.status(400).json({
        message: 'Price and stock are required.'
      });
    }

    const products = await readData('products.json');

    const product = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name,
      category,
      price,
      stock,
      rating,
      createdAt: new Date().toISOString()
    };

    products.push(product);
    await writeData('products.json', products);

    res.status(201).json({
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex(item => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const allowedFields = ['name', 'category', 'price', 'stock', 'rating'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        products[index][field] = req.body[field];
      }
    }

    await writeData('products.json', products);

    res.status(200).json({
      message: 'Product updated successfully.',
      product: products[index]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex(item => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const deletedProduct = products.splice(index, 1)[0];
    await writeData('products.json', products);

    res.status(200).json({
      message: 'Product deleted successfully.',
      product: deletedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getProducts = async (req, res, next) => {
  try {
    let products = await readData('products.json');
    const { category, minPrice, maxPrice, inStock, sort, search } = req.query;

    if (category) {
      products = products.filter(
        product => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (Number.isNaN(min)) {
        return res.status(400).json({ message: 'minPrice must be a number' });
      }
      products = products.filter(product => product.price >= min);
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);
      if (Number.isNaN(max)) {
        return res.status(400).json({ message: 'maxPrice must be a number' });
      }
      products = products.filter(product => product.price <= max);
    }

    if (inStock === 'true') {
      products = products.filter(product => product.stock > 0);
    }

    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'name_asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const { name, category, price, stock, rating = 0 } = req.body;

    const product = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      category: category.trim(),
      price,
      stock,
      rating,
      createdAt: new Date().toISOString()
    };

    products.push(product);
    await writeData('products.json', products);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allowedFields = ['name', 'category', 'price', 'stock', 'rating'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        products[index][field] = req.body[field];
      }
    }

    await writeData('products.json', products);

    res.json({
      message: 'Product updated successfully',
      product: products[index]
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [deletedProduct] = products.splice(index, 1);
    await writeData('products.json', products);

    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};

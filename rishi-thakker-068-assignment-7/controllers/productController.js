const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';

// GET /api/products
const getProducts = async (req, res) => {
  try {
    let products = await readData(PRODUCTS_FILE);
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
      const sorters = {
        price_asc: (a, b) => a.price - b.price,
        price_desc: (a, b) => b.price - a.price,
        rating_desc: (a, b) => b.rating - a.rating,
        newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      };
      if (sorters[sort]) products = [...products].sort(sorters[sort]);
    }

    res.status(200).json({ count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;

    const products = await readData(PRODUCTS_FILE);

    const newProduct = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name,
      category,
      price,
      stock: stock ?? 0,
      rating: rating ?? 0,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);

    res.status(201).json({ message: 'Product created.', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    products[index] = { ...products[index], ...req.body };
    await writeData(PRODUCTS_FILE, products);

    res.status(200).json({ message: 'Product updated.', product: products[index] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const [removed] = products.splice(index, 1);
    await writeData(PRODUCTS_FILE, products);

    res.status(200).json({ message: 'Product deleted.', product: removed });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

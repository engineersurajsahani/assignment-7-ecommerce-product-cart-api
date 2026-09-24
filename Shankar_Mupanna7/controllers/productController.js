const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';

const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, search, sort } = req.query;
    let products = await readData(PRODUCTS_FILE);

    // Filtering by category
    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filtering by minPrice
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      const minP = Number(minPrice);
      products = products.filter((p) => p.price >= minP);
    }

    // Filtering by maxPrice
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      const maxP = Number(maxPrice);
      products = products.filter((p) => p.price <= maxP);
    }

    // Filtering by inStock
    if (inStock !== undefined) {
      const onlyInStock = inStock === 'true' || inStock === true;
      if (onlyInStock) {
        products = products.filter((p) => p.stock > 0);
      }
    }

    // Search by name or category
    if (search) {
      const query = search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating_desc':
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${id}' not found.`
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData(PRODUCTS_FILE);

    const newProduct = {
      id: `prod_${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating !== undefined ? Number(rating) : 0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);

    res.status(201).json({
      message: 'Product created successfully.',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, rating } = req.body;
    const products = await readData(PRODUCTS_FILE);

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${id}' not found.`
      });
    }

    const updatedProduct = {
      ...products[index],
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(rating !== undefined && { rating: Number(rating) }),
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    await writeData(PRODUCTS_FILE, products);

    res.status(200).json({
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Product with ID '${id}' not found.`
      });
    }

    const deletedProduct = products.splice(index, 1)[0];
    await writeData(PRODUCTS_FILE, products);

    res.status(200).json({
      message: 'Product deleted successfully.',
      product: deletedProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

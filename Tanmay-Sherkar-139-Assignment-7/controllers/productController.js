const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const PRODUCTS_FILE = 'products.json';


const getAllProducts = async (req, res) => {
  try {
    let products = await readData(PRODUCTS_FILE);

    const { category, minPrice, maxPrice, inStock, search, sort } = req.query;

    if (category) {
      const targetCategory = category.toLowerCase().trim();
      products = products.filter(
        (p) => p.category && p.category.toLowerCase() === targetCategory
      );
    }

    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        products = products.filter((p) => p.price >= min);
      }
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        products = products.filter((p) => p.price <= max);
      }
    }

    if (inStock !== undefined) {
      const isStockOnly = inStock === 'true' || inStock === true;
      if (isStockOnly) {
        products = products.filter((p) => p.stock > 0);
      } else if (inStock === 'false' || inStock === false) {
        products = products.filter((p) => p.stock === 0);
      }
    }

    if (search) {
      const term = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    if (sort) {
      switch (sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating_asc':
          products.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        case 'rating_desc':
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products.'
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);

    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product.'
    });
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
      rating: rating !== undefined ? Number(rating) : 5.0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating product.'
    });
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
        success: false,
        message: `Product with ID '${id}' not found.`
      });
    }

    const current = products[index];

    const updatedProduct = {
      ...current,
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(rating !== undefined && { rating: Number(rating) }),
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating product.'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found.`
      });
    }

    const deleted = products.splice(index, 1)[0];
    await writeData(PRODUCTS_FILE, products);

    return res.status(200).json({
      success: true,
      message: `Product '${deleted.name}' (ID: ${id}) was deleted successfully.`,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting product.'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

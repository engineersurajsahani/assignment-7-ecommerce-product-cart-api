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
        (product) =>
          product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);

      if (Number.isNaN(min)) {
        return res.status(400).json({
          message: 'minPrice must be a valid number.'
        });
      }

      products = products.filter(
        (product) => product.price >= min
      );
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);

      if (Number.isNaN(max)) {
        return res.status(400).json({
          message: 'maxPrice must be a valid number.'
        });
      }

      products = products.filter(
        (product) => product.price <= max
      );
    }

    if (inStock !== undefined) {
      if (inStock === 'true') {
        products = products.filter(
          (product) => product.stock > 0
        );
      } else if (inStock === 'false') {
        products = products.filter(
          (product) => product.stock === 0
        );
      }
    }

    if (search) {
      const query = search.toLowerCase();

      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

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
      case 'rating_asc':
        products.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
        products.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      default:
        break;
    }

    return res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching products.',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');

    const product = products.find(
      (item) => item.id === req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching product.',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      stock,
      rating = 0
    } = req.body;

    const products = await readData('products.json');

    const newProduct = {
      id: `prod_${uuidv4().split('-')[0]}`,
      name,
      category,
      price,
      stock,
      rating,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData('products.json', products);

    return res.status(201).json({
      message: 'Product created successfully.',
      product: newProduct
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while creating product.',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const products = await readData('products.json');

    const productIndex = products.findIndex(
      (item) => item.id === req.params.id
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const allowedFields = [
      'name',
      'category',
      'price',
      'stock',
      'rating'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        products[productIndex][field] = req.body[field];
      }
    });

    products[productIndex].updatedAt = new Date().toISOString();

    await writeData('products.json', products);

    return res.status(200).json({
      message: 'Product updated successfully.',
      product: products[productIndex]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while updating product.',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const products = await readData('products.json');

    const productIndex = products.findIndex(
      (item) => item.id === req.params.id
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    await writeData('products.json', products);

    return res.status(200).json({
      message: 'Product deleted successfully.',
      product: deletedProduct
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while deleting product.',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

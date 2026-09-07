const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getProducts = async (req, res, next) => {
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
      const minimum = Number(minPrice);
      if (Number.isNaN(minimum)) {
        return res.status(400).json({
          success: false,
          message: 'minPrice must be a number.'
        });
      }
      products = products.filter((product) => product.price >= minimum);
    }

    if (maxPrice !== undefined) {
      const maximum = Number(maxPrice);
      if (Number.isNaN(maximum)) {
        return res.status(400).json({
          success: false,
          message: 'maxPrice must be a number.'
        });
      }
      products = products.filter((product) => product.price <= maximum);
    }

    if (inStock !== undefined) {
      const shouldFilterInStock = inStock === 'true';

      if (inStock !== 'true' && inStock !== 'false') {
        return res.status(400).json({
          success: false,
          message: 'inStock must be true or false.'
        });
      }

      products = products.filter((product) =>
        shouldFilterInStock ? product.stock > 0 : product.stock === 0
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
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
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        if (sort) {
          return res.status(400).json({
            success: false,
            message: 'Invalid sort. Use price_asc, price_desc, rating_desc or name_asc.'
          });
        }
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const product = products.find((item) => item.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');

    const product = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name: req.body.name.trim(),
      category: req.body.category.trim(),
      price: req.body.price,
      stock: req.body.stock,
      rating: req.body.rating ?? 0,
      createdAt: new Date().toISOString()
    };

    products.push(product);
    await writeData('products.json', products);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const allowedFields = ['name', 'category', 'price', 'stock', 'rating'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        products[index][field] =
          typeof req.body[field] === 'string'
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    await writeData('products.json', products);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: products[index]
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const [deletedProduct] = products.splice(index, 1);
    await writeData('products.json', products);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      product: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

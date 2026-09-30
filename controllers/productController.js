const path = require("path");
const { readJSON, writeJSON } = require("../utils/fileHelper");

const productsFile = path.join(__dirname, "../data/products.json");

// Get all products
const getProducts = async (req, res) => {
  try {
    let products = await readJSON(productsFile);

    const { category, minPrice, maxPrice, inStock, sort } = req.query;

    if (category) {
      products = products.filter(
        (product) =>
          product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice) {
      products = products.filter(
        (product) => product.price >= Number(minPrice)
      );
    }

    if (maxPrice) {
      products = products.filter(
        (product) => product.price <= Number(maxPrice)
      );
    }

    if (inStock === "true") {
      products = products.filter(
        (product) => product.stock > 0
      );
    }

    if (sort === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    }

    if (sort === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    }

    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const products = await readJSON(productsFile);

    const product = products.find(
      (product) =>
        product.id.toString() === req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    const products = await readJSON(productsFile);

    const newProduct = {
      id: Date.now().toString(),
      name,
      category,
      price: Number(price),
      stock: Number(stock),
    };

    products.push(newProduct);

    await writeJSON(productsFile, products);

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const products = await readJSON(productsFile);

    const index = products.findIndex(
      (product) =>
        product.id.toString() === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const { name, category, price, stock } = req.body;

    products[index] = {
      ...products[index],
      name,
      category,
      price: Number(price),
      stock: Number(stock),
    };

    await writeJSON(productsFile, products);

    res.json({
      message: "Product updated successfully",
      product: products[index],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const products = await readJSON(productsFile);

    const index = products.findIndex(
      (product) =>
        product.id.toString() === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const deletedProduct = products.splice(index, 1)[0];

    await writeJSON(productsFile, products);

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
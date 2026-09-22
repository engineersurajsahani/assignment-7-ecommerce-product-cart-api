const express = require("express");
const { v4: uuidv4 } = require("uuid");
const validateProduct = require("../middleware/validateProduct");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../model/productModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts(req.query);
    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", validateProduct, async (req, res, next) => {
  try {
    const { name, category, price, stock, rating } = req.body;

    const newProduct = {
      id: uuidv4(),
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating !== undefined ? Number(rating) : 0,
      createdAt: new Date().toISOString()
    };

    const created = await createProduct(newProduct);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: created
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", validateProduct, async (req, res, next) => {
  try {
    const existingProduct = await getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const { name, category, price, stock, rating } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (rating !== undefined) updateData.rating = Number(rating);

    const updated = await updateProduct(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existingProduct = await getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await deleteProduct(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

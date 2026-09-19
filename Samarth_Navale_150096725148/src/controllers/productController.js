const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, inStock, search, sort } = req.query;
    let list = await readData('products.json');

    if (category) {
      list = list.filter((p) => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      list = list.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      list = list.filter((p) => p.price <= Number(maxPrice));
    }

    if (inStock !== undefined) {
      const stockCheck = inStock === 'true' || inStock === '1';
      list = list.filter((p) => (stockCheck ? p.stock > 0 : p.stock === 0));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (sort) {
      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (sort === 'rating_desc') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
      else if (sort === 'name_desc') list.sort((a, b) => b.name.localeCompare(a.name));
      else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await readData('products.json');
    const item = list.find((p) => p.id === id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const list = await readData('products.json');

    const newProd = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating !== undefined ? Number(rating) : 0,
      createdAt: new Date().toISOString()
    };

    list.push(newProd);
    await writeData('products.json', list);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProd
    });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, rating } = req.body;
    const list = await readData('products.json');

    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const current = list[idx];
    const updated = {
      ...current,
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(rating !== undefined && { rating: Number(rating) }),
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    await writeData('products.json', list);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await readData('products.json');

    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    list.splice(idx, 1);
    await writeData('products.json', list);

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

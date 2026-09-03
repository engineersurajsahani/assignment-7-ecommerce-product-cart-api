const { v4: uuidv4 } = require('uuid');
const { readData, writeData, withDataLock } = require('../utils/fileHelper');

const getProducts = async (req, res, next) => {
  try {
    let products = await readData('products.json');
    const { category, minPrice, maxPrice, sort, search } = req.query;
    if (category) products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (minPrice !== undefined) {
      if (!Number.isFinite(Number(minPrice))) return res.status(400).json({ message: 'minPrice must be numeric' });
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined) {
      if (!Number.isFinite(Number(maxPrice))) return res.status(400).json({ message: 'maxPrice must be numeric' });
      products = products.filter((p) => p.price <= Number(maxPrice));
    }
    if (search) products = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
    const sorters = { price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, rating_asc: (a, b) => a.rating - b.rating, rating_desc: (a, b) => b.rating - a.rating, name_asc: (a, b) => a.name.localeCompare(b.name), name_desc: (a, b) => b.name.localeCompare(a.name) };
    if (sort) {
      if (!sorters[sort]) return res.status(400).json({ message: 'Unsupported sort option' });
      products.sort(sorters[sort]);
    }
    res.json({ count: products.length, products });
  } catch (error) { next(error); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = (await readData('products.json')).find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;
  if (!name?.trim() || !category?.trim() || price === undefined || stock === undefined || rating === undefined) {
    return res.status(400).json({ message: 'name, category, price, stock, and rating are required' });
  }
  try {
    const product = await withDataLock(async () => {
      const products = await readData('products.json');
      const newProduct = { id: `prod_${uuidv4()}`, name: name.trim(), category: category.trim(), price: Number(price), stock: Number(stock), rating: Number(rating), createdAt: new Date().toISOString() };
      products.push(newProduct);
      await writeData('products.json', products);
      return newProduct;
    });
    res.status(201).json({ message: 'Product created', product });
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  const permitted = ['price', 'stock'];
  if (!Object.keys(req.body).some((key) => permitted.includes(key))) return res.status(400).json({ message: 'Provide price and/or stock to update' });
  try {
    const product = await withDataLock(async () => {
      const products = await readData('products.json');
      const index = products.findIndex((p) => p.id === req.params.id);
      if (index === -1) { const error = new Error('Product not found'); error.status = 404; throw error; }
      for (const key of permitted) if (req.body[key] !== undefined) products[index][key] = Number(req.body[key]);
      await writeData('products.json', products);
      return products[index];
    });
    res.json({ message: 'Product updated', product });
  } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
  try {
    await withDataLock(async () => {
      const products = await readData('products.json');
      const index = products.findIndex((p) => p.id === req.params.id);
      if (index === -1) { const error = new Error('Product not found'); error.status = 404; throw error; }
      products.splice(index, 1);
      await writeData('products.json', products);
    });
    res.json({ message: 'Product deleted' });
  } catch (error) { next(error); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };

const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

exports.getAllProducts = async (req, res) => {
  let products = await readData('products.json');
  const { category, minPrice, maxPrice, sort } = req.query;

  if (category) products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));

  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);

  res.status(200).json(products);
};

exports.getProductById = async (req, res) => {
  const products = await readData('products.json');
  const product = products.find(p => p.id === req.params.id);
  product ? res.status(200).json(product) : res.status(404).json({ error: 'Product not found' });
};

exports.addProduct = async (req, res) => {
  const { name, category, price, stock, rating } = req.body;
  const products = await readData('products.json');
  
  const newProduct = {
    id: `prod_${uuidv4()}`,
    name, category, price, stock, rating: rating || 0,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  await writeData('products.json', products);
  res.status(201).json(newProduct);
};

exports.updateProduct = async (req, res) => {
  const products = await readData('products.json');
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  products[index] = { ...products[index], ...req.body };
  await writeData('products.json', products);
  res.status(200).json(products[index]);
};

exports.deleteProduct = async (req, res) => {
  let products = await readData('products.json');
  const filtered = products.filter(p => p.id !== req.params.id);
  
  if (products.length === filtered.length) return res.status(404).json({ error: 'Product not found' });
  
  await writeData('products.json', filtered);
  res.status(200).json({ message: 'Product deleted' });
};
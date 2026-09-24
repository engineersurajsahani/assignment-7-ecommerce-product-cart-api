const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

exports.getAllProducts = async (req, res) => {
  try {
    let products = await readData('products.json');
    const { category, minPrice, maxPrice, inStock, sort, search } = req.query;

    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)));
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => p.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => p.price <= max);
      }
    }

    if (inStock === 'true') {
      products = products.filter(p => p.stock > 0);
    }

    if (sort) {
      switch (sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const products = await readData('products.json');
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, rating } = req.body;
    const products = await readData('products.json');

    const newProduct = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating !== undefined ? Number(rating) : 5.0,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData('products.json', products);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, category, price, stock, rating } = req.body;
    if (name !== undefined) products[index].name = name.trim();
    if (category !== undefined) products[index].category = category.trim();
    if (price !== undefined) products[index].price = Number(price);
    if (stock !== undefined) products[index].stock = Number(stock);
    if (rating !== undefined) products[index].rating = Number(rating);
    products[index].updatedAt = new Date().toISOString();

    await writeData('products.json', products);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: products[index]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const products = await readData('products.json');
    const filtered = products.filter(p => p.id !== req.params.id);

    if (filtered.length === products.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await writeData('products.json', filtered);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

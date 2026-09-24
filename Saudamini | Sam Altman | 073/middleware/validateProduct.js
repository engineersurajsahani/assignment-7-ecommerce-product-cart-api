// middleware/validateProduct.js
const validateProduct = (req, res, next) => {
  const { name, price, stock, category } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive price is required' });
    }
    if (stock === undefined || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
  } else if (req.method === 'PUT') {
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
    }
  }

  next();
};

module.exports = validateProduct;

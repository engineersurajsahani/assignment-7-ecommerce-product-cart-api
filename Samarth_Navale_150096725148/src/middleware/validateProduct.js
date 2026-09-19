const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }
    if (stock === undefined || typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({ success: false, message: 'Stock must be an integer >= 0' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5' });
    }
  }

  if (req.method === 'PUT') {
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
      return res.status(400).json({ success: false, message: 'Stock must be an integer >= 0' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5' });
    }
  }

  next();
};

module.exports = validateProduct;

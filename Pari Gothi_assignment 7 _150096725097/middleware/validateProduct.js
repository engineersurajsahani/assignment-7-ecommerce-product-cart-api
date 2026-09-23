const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ success: false, message: 'Name must be a non-empty string.' });
  }

  if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
    return res.status(400).json({ success: false, message: 'Category must be a non-empty string.' });
  }

  if (price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price <= 0)) {
    return res.status(400).json({ success: false, message: 'Price must be greater than 0.' });
  }

  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    return res.status(400).json({ success: false, message: 'Stock must be an integer greater than or equal to 0.' });
  }

  if (rating !== undefined && (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 0 || rating > 5)) {
    return res.status(400).json({ success: false, message: 'Rating must be a number between 0 and 5.' });
  }

  next();
};

module.exports = validateProduct;

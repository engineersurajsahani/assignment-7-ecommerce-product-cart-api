const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;
  const isPost = req.method === 'POST';

  if (isPost) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Bad Request', message: 'Product name is required.' });
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'Bad Request', message: 'Product category is required.' });
    }
    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product price must be a positive number (> 0).' });
    }
    if (stock === undefined || typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product stock must be a non-negative integer (>= 0).' });
    }
  } else {
    // For PUT updates
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product price must be a positive number (> 0).' });
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product stock must be a non-negative integer (>= 0).' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Product rating must be a number between 0 and 5.' });
    }
  }

  next();
};

module.exports = validateProduct;

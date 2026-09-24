const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required and must be a string' });
  }

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category is required and must be a string' });
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a number greater than 0' });
  }

  if (stock === undefined || typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ error: 'Stock must be a number greater than or equal to 0' });
  }

  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    return res.status(400).json({ error: 'Rating must be a number between 0 and 5' });
  }

  next();
};

const validateProductUpdate = (req, res, next) => {
  const { price, stock } = req.body;

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Price must be a number greater than 0' });
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({ error: 'Stock must be a number greater than or equal to 0' });
  }

  next();
};

module.exports = { validateProduct, validateProductUpdate };

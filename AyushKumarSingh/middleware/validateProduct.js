

const validateProduct = (req, res, next) => {
  const { name, category, price, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('name is required and must be a non-empty string');
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('category is required and must be a non-empty string');
  }
  if (price === undefined || typeof price !== 'number' || price <= 0) {
    errors.push('price is required and must be a number greater than 0');
  }
  if (stock === undefined || typeof stock !== 'number' || stock < 0) {
    errors.push('stock is required and must be a number greater than or equal to 0');
  }
  if (
    req.body.rating !== undefined &&
    (typeof req.body.rating !== 'number' || req.body.rating < 0 || req.body.rating > 5)
  ) {
    errors.push('rating must be a number between 0 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

const validateProductUpdate = (req, res, next) => {
  const { price, stock, rating } = req.body;
  const errors = [];

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    errors.push('price must be a number greater than 0');
  }
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    errors.push('stock must be a number greater than or equal to 0');
  }
  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    errors.push('rating must be a number between 0 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

module.exports = { validateProduct, validateProductUpdate };

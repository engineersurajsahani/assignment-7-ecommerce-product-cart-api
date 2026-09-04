/**
 * Product validation middleware for POST and PUT requests
 */
const validateProduct = (req, res, next) => {
  const isPost = req.method === 'POST';
  const { name, category, price, stock, rating } = req.body;

  const errors = [];

  if (isPost) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push('Name is required and must be a non-empty string.');
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      errors.push('Category is required and must be a non-empty string.');
    }
    if (price === undefined || typeof price !== 'number' || price <= 0) {
      errors.push('Price is required and must be a positive number (> 0).');
    }
    if (stock === undefined || typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      errors.push('Stock is required and must be a non-negative integer (>= 0).');
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      errors.push('Rating must be a number between 0 and 5.');
    }
  } else {
    // PUT (Update) validation
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update.'
      });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      errors.push('Name must be a non-empty string.');
    }
    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
      errors.push('Category must be a non-empty string.');
    }
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      errors.push('Price must be a positive number (> 0).');
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
      errors.push('Stock must be a non-negative integer (>= 0).');
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      errors.push('Rating must be a number between 0 and 5.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = validateProduct;

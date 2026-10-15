/**
 * Validation middleware for product creation and updating
 */
const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  // On POST (creation), name, category, price, stock are required
  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product name is required and must be a non-empty string'
      });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Category is required and must be a non-empty string'
      });
    }

    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Price must be a number greater than 0'
      });
    }

    if (stock === undefined || typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Stock must be a non-negative integer (>= 0)'
      });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Rating must be a number between 0 and 5'
      });
    }
  }

  // On PUT/PATCH (partial or full update), validate only fields present in body
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product name must be a non-empty string'
      });
    }

    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Category must be a non-empty string'
      });
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Price must be a number greater than 0'
      });
    }

    if (stock !== undefined && (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock))) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Stock must be a non-negative integer (>= 0)'
      });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Rating must be a number between 0 and 5'
      });
    }
  }

  next();
};

module.exports = validateProduct;

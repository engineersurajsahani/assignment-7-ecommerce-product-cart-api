
const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;
  const isPost = req.method === 'POST';

  if (isPost) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product name is required and must be a non-empty string.'
      });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product category is required and must be a non-empty string.'
      });
    }

    if (price === undefined || price === null || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product price is required and must be a number greater than 0.'
      });
    }

    if (stock === undefined || stock === null || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product stock is required and must be an integer greater than or equal to 0.'
      });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product rating must be a number between 0 and 5.'
      });
    }
  } else {
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product name must be a non-empty string.'
      });
    }

    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product category must be a non-empty string.'
      });
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product price must be a number greater than 0.'
      });
    }

    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product stock must be an integer greater than or equal to 0.'
      });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Product rating must be a number between 0 and 5.'
      });
    }
  }

  next();
};

module.exports = validateProduct;

const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  if (req.method === 'POST') {
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required.'
      });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0.'
      });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be an integer greater than or equal to 0.'
      });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 0 and 5.'
      });
    }
  }

  if (req.method === 'PUT') {
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0.'
      });
    }

    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be an integer greater than or equal to 0.'
      });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 0 and 5.'
      });
    }
  }

  next();
};

module.exports = validateProduct;

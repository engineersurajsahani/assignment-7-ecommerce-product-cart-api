const validateRequiredFields = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const validateProduct = (options = {}) => {
  const requireCoreFields = options.requireCoreFields || false;

  return (req, res, next) => {
    const { name, category, price, stock, rating } = req.body || {};

    // On create, name, category and price are mandatory.
    if (requireCoreFields) {
      if (!validateRequiredFields(name)) {
        return res.status(400).json({ message: 'name is required and must be a non-empty string' });
      }

      if (!validateRequiredFields(category)) {
        return res.status(400).json({ message: 'category is required and must be a non-empty string' });
      }

      if (price === undefined) {
        return res.status(400).json({ message: 'price is required' });
      }
    } else {
      // On update, only validate the fields that were actually sent.
      if (name !== undefined && !validateRequiredFields(name)) {
        return res.status(400).json({ message: 'name must be a non-empty string' });
      }

      if (category !== undefined && !validateRequiredFields(category)) {
        return res.status(400).json({ message: 'category must be a non-empty string' });
      }
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ message: 'price must be a number greater than 0' });
      }
    }

    if (stock !== undefined) {
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ message: 'stock must be an integer greater than or equal to 0' });
      }
    }

    if (rating !== undefined) {
      if (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'rating must be a number between 0 and 5' });
      }
    }

    next();
  };
};

module.exports = validateProduct;
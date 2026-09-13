const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  if (req.method === 'POST') {
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: 'name, category, price and stock are required.'
      });
    }
  }

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({
      message: 'Price must be a number greater than 0.'
    });
  }

  if (
    stock !== undefined &&
    (
      typeof stock !== 'number' ||
      stock < 0 ||
      !Number.isInteger(stock)
    )
  ) {
    return res.status(400).json({
      message: 'Stock must be a non-negative integer.'
    });
  }

  if (
    rating !== undefined &&
    (
      typeof rating !== 'number' ||
      rating < 0 ||
      rating > 5
    )
  ) {
    return res.status(400).json({
      message: 'Rating must be between 0 and 5.'
    });
  }

  next();
};

module.exports = validateProduct;

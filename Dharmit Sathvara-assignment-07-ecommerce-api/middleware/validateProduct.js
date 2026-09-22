const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;

  if (req.method === 'POST') {
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: 'name, category, price and stock are required'
      });
    }
  }

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ message: 'price must be a number greater than 0' });
  }

  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    return res.status(400).json({ message: 'stock must be an integer greater than or equal to 0' });
  }

  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    return res.status(400).json({ message: 'rating must be between 0 and 5' });
  }

  next();
};

module.exports = validateProduct;

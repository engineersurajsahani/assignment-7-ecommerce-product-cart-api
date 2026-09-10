const validateProduct = (req, res, next) => {
  const { name, category, price, stock } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'name and category are required' });
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ message: 'price must be a number greater than 0' });
  }

  if (stock === undefined || typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ message: 'stock must be a number 0 or greater' });
  }

  next();
};

module.exports = validateProduct;

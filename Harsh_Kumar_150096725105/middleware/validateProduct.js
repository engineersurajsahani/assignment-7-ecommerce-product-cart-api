module.exports = (req, res, next) => {
  const { price, stock } = req.body;
  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({ message: 'Stock must be a non-negative number' });
  }
  next();
};

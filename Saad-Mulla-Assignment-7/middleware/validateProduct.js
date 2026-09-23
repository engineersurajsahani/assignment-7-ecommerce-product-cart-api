const validateProduct = (req, res, next) => {
  const { price, stock } = req.body;
  if (price !== undefined && price <= 0) return res.status(400).json({ error: 'Price must be greater than 0' });
  if (stock !== undefined && stock < 0) return res.status(400).json({ error: 'Stock cannot be negative' });
  next();
};
module.exports = validateProduct;
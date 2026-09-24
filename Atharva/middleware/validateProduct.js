const validateProduct = (req, res, next) => {
  const { price, stock } = req.body;
  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ success: false, message: 'Price must be a number greater than 0.' });
  }
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({ success: false, message: 'Stock must be a number greater than or equal to 0.' });
  }
  next();
};

module.exports = validateProduct;

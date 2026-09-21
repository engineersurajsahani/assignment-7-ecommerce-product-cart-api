const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;
  
  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, category, price, stock' });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  
  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ error: 'Stock must be a non-negative number' });
  }
  
  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  }
  
  next();
};

module.exports = validateProduct;

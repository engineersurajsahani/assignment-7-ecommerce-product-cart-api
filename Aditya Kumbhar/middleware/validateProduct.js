const validateProduct = (req, res, next) => {
  const { name, category, price, stock } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: 'Product name is required.' });
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ message: 'Category is required.' });
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ message: 'Price must be a number greater than 0.' });
  }

  if (stock === undefined || typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ message: 'Stock must be a non-negative number.' });
  }

  next();
};

module.exports = validateProduct;

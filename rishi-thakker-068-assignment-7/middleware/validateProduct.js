const validateProduct = (req, res, next) => {
  const { name, category, price, stock } = req.body;
  const isCreate = req.method === 'POST';

  if (isCreate && (!name || !category)) {
    return res.status(400).json({ message: 'name and category are required.' });
  }

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ message: 'price must be a number greater than 0.' });
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({ message: 'stock must be a number greater than or equal to 0.' });
  }

  next();
};

module.exports = validateProduct;

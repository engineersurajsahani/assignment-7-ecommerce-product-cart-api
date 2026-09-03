module.exports = (req, res, next) => {
  const { price, stock, rating } = req.body;
  if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
    return res.status(400).json({ message: 'price must be a number greater than 0' });
  }
  if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
    return res.status(400).json({ message: 'stock must be a non-negative integer' });
  }
  if (rating !== undefined && (!Number.isFinite(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
    return res.status(400).json({ message: 'rating must be between 0 and 5' });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const { name, category, price, stock } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({
      message: "Name, category, price and stock are required",
    });
  }

  if (Number(price) < 0 || Number(stock) < 0) {
    return res.status(400).json({
      message: "Price and stock cannot be negative",
    });
  }

  next();
};

module.exports = validateProduct;
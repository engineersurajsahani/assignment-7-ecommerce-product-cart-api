const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;
  const isPost = req.method === "POST";

  if (isPost) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required"
      });
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product category is required"
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Product price is required"
      });
    }

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: "Product stock is required"
      });
    }
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than 0"
      });
    }
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer (0 or greater)"
      });
    }
  }

  if (rating !== undefined && rating !== null) {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 0 and 5"
      });
    }
  }

  next();
};

module.exports = validateProduct;

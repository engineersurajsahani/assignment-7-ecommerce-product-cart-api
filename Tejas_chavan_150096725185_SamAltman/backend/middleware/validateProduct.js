// middleware/validateProduct.js
// Validates product payloads for POST /api/products and PUT /api/products/:id.
// - On create (POST): name, category, price, stock are required.
// - On update (PUT): fields are optional, but any field that IS provided
//   must pass the same rules (price > 0, stock >= 0, etc).

const isCreateRoute = (req) => req.method === 'POST';

const validateProduct = (req, res, next) => {
  const { name, category, price, stock, rating } = req.body;
  const errors = [];
  const creating = isCreateRoute(req);

  // --- name ---
  if (creating && (typeof name !== 'string' || !name.trim())) {
    errors.push('name is required and must be a non-empty string.');
  } else if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    errors.push('name must be a non-empty string.');
  }

  // --- category ---
  if (creating && (typeof category !== 'string' || !category.trim())) {
    errors.push('category is required and must be a non-empty string.');
  } else if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
    errors.push('category must be a non-empty string.');
  }

  // --- price ---
  if (creating && price === undefined) {
    errors.push('price is required.');
  }
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      errors.push('price must be a number greater than 0.');
    }
  }

  // --- stock ---
  if (creating && stock === undefined) {
    errors.push('stock is required.');
  }
  if (stock !== undefined) {
    const numericStock = Number(stock);
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      errors.push('stock must be an integer greater than or equal to 0.');
    }
  }

  // --- rating (optional on both create & update) ---
  if (rating !== undefined) {
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      errors.push('rating must be a number between 0 and 5.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

module.exports = validateProduct;

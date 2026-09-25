// Checks the product body before it reaches the controller.
// POST: name, category, price, stock are required.
// PUT: every field is optional, but whatever IS sent must be valid.
// Cleaned values replace request.body, so the controller can trust them.
function validateProduct(request, response, next) {
  const body = request.body || {};
  const isCreate = request.method === "POST";
  const clean = {};
  const errors = [];

  for (const key of ["name", "category"]) {
    if (body[key] === undefined) {
      if (isCreate) errors.push(`${key} is required`);
      continue;
    }
    const value = String(body[key]).trim();
    if (!value) {
      errors.push(`${key} cannot be empty`);
    } else {
      clean[key] = value;
    }
  }

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      errors.push("price must be a number greater than 0");
    } else {
      clean.price = price;
    }
  } else if (isCreate) {
    errors.push("price is required");
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push("stock must be a whole number, 0 or more");
    } else {
      clean.stock = stock;
    }
  } else if (isCreate) {
    errors.push("stock is required");
  }

  // rating is optional everywhere
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      errors.push("rating must be between 0 and 5");
    } else {
      clean.rating = rating;
    }
  }

  if (errors.length > 0) {
    return response.status(400).json({ message: errors.join(", ") });
  }

  if (Object.keys(clean).length === 0) {
    return response.status(400).json({ message: "No valid fields to update" });
  }

  request.body = clean;
  next();
}

module.exports = validateProduct;

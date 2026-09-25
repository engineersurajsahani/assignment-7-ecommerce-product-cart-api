const { v4: uuidv4 } = require("uuid");
const { readData, writeData, withLock } = require("../utils/fileHelper");

const PRODUCTS_FILE = "products.json";

// ?sort=<key> -> compare function
const SORTERS = {
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  rating_desc: (a, b) => b.rating - a.rating,
  name_asc: (a, b) => a.name.localeCompare(b.name),
  newest: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
};

// GET /api/products?search=&category=&minPrice=&maxPrice=&inStock=true&sort=
// Every filter is optional and they all stack (AND).
async function getProducts(request, response) {
  try {
    const { search, category, minPrice, maxPrice, inStock, sort } =
      request.query;

    // validate numbers first -- "abc" should be a 400, not an empty list
    const min = minPrice !== undefined ? Number(minPrice) : null;
    const max = maxPrice !== undefined ? Number(maxPrice) : null;
    if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) {
      return response
        .status(400)
        .json({ message: "minPrice and maxPrice must be numbers" });
    }
    if (min !== null && max !== null && min > max) {
      return response
        .status(400)
        .json({ message: "minPrice cannot be greater than maxPrice" });
    }
    if (sort && !SORTERS[sort]) {
      return response.status(400).json({
        message: `sort must be one of: ${Object.keys(SORTERS).join(", ")}`,
      });
    }

    let products = await readData(PRODUCTS_FILE);

    if (search) {
      const needle = String(search).toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle),
      );
    }

    if (category) {
      const wanted = String(category).toLowerCase().trim();
      products = products.filter((p) => p.category.toLowerCase() === wanted);
    }

    if (min !== null) {
      products = products.filter((p) => p.price >= min);
    }

    if (max !== null) {
      products = products.filter((p) => p.price <= max);
    }

    if (inStock === "true") {
      products = products.filter((p) => p.stock > 0);
    }

    if (sort) {
      products.sort(SORTERS[sort]);
    }

    return response.status(200).json({ count: products.length, products });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

// list of distinct categories, for the frontend dropdown
async function getCategories(request, response) {
  try {
    const products = await readData(PRODUCTS_FILE);
    const categories = [...new Set(products.map((p) => p.category))].sort();
    return response.status(200).json({ categories });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

async function getProductById(request, response) {
  try {
    const products = await readData(PRODUCTS_FILE);
    const product = products.find((p) => p.id === request.params.id);
    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }
    return response.status(200).json({ product });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

// body already checked + cleaned by validateProduct
async function createProduct(request, response) {
  try {
    const { name, category, price, stock, rating } = request.body;

    const product = {
      id: `prod_${uuidv4().slice(0, 8)}`,
      name,
      category,
      price,
      stock,
      rating: rating ?? 0,
      createdAt: new Date().toISOString(),
    };

    await withLock(async () => {
      const products = await readData(PRODUCTS_FILE);
      products.push(product);
      await writeData(PRODUCTS_FILE, products);
    });

    return response.status(201).json({ message: "Product created", product });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

async function updateProduct(request, response) {
  try {
    const product = await withLock(async () => {
      const products = await readData(PRODUCTS_FILE);
      const index = products.findIndex((p) => p.id === request.params.id);
      if (index === -1) {
        return null;
      }
      // only the validated fields are merged; id / createdAt never change
      products[index] = { ...products[index], ...request.body };
      await writeData(PRODUCTS_FILE, products);
      return products[index];
    });

    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }
    return response.status(200).json({ message: "Product updated", product });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

async function deleteProduct(request, response) {
  try {
    const product = await withLock(async () => {
      const products = await readData(PRODUCTS_FILE);
      const index = products.findIndex((p) => p.id === request.params.id);
      if (index === -1) {
        return null;
      }
      const [removed] = products.splice(index, 1);
      await writeData(PRODUCTS_FILE, products);
      return removed;
    });

    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }
    return response.status(200).json({ message: "Product deleted", product });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

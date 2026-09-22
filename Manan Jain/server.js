const express = require("express");
const session = require("express-session");
require("dotenv").config();

const loggerMiddleware = require("./middleware/loggerMiddleware");
const authRouter = require("./router/authRouter");
const productRouter = require("./router/productRouter");
const cartRouter = require("./router/cartRouter");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_ecom_key_fallback",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the E-Commerce Product Catalog and Shopping Cart REST API",
    documentation: "/README.md",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      cart: "/api/cart"
    }
  });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`=================================`);
  });
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

// Middlewares
const logger = require('./middleware/logger');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ecommerce_super_secret_session_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production if running HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Custom Request Logger
app.use(logger);

// Base API Info Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'E-Commerce Product & Shopping Cart REST API',
    version: '1.0.0',
    status: 'Healthy',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout'
      },
      products: {
        list: 'GET /api/products (supports category, minPrice, maxPrice, inStock, search, sort)',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      cart: {
        view: 'GET /api/cart (Authenticated)',
        addItem: 'POST /api/cart/items (Authenticated)',
        removeItem: 'DELETE /api/cart/items/:productId (Authenticated)',
        checkout: 'POST /api/cart/checkout (Authenticated)'
      }
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server (only if not imported by tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 E-Commerce API Server running on port ${PORT} (http://localhost:${PORT})`);
  });
}

module.exports = app;

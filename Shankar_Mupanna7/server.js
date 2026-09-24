require('dotenv').config();
const express = require('express');
const session = require('express-session');
const logger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom request logger middleware
app.use(logger);

// Session middleware configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keralaxplore_ecommerce_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if running over HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the E-Commerce Product Catalog & Shopping Cart REST API',
    version: '1.0.0',
    documentation: '/api/products, /api/auth, /api/cart'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}


module.exports = app;

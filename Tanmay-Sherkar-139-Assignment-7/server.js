require('dotenv').config();
const express = require('express');
const session = require('express-session');
const logger = require('./middleware/logger');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ecommerce_assignment_07_tanmay_sherkar_secret_key_139',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the E-Commerce Product & Shopping Cart REST API',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart'
    },
    documentation: 'See README.md for endpoint specifications'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found.`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Base URL: http://localhost:${PORT}`);
  });
}

module.exports = app;

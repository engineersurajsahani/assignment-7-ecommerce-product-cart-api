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

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(logger);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the E-Commerce Product Catalog & Shopping Cart API',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require('dotenv').config();

const express = require('express');
const session = require('express-session');

const logger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60
    }
  })
);

app.use(logger);

app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce Product & Shopping Cart API is running.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
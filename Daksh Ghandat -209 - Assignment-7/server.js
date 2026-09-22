require('dotenv').config();

const express = require('express');
const session = require('express-session');

const logger = require('./middleware/logger');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON bodies
app.use(express.json());

// Log every request
app.use(logger);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
    resave: false,
    saveUninitialized: false,
  })
);

// Home / health endpoints
app.get('/', (req, res) => {
  res.status(200).json({ message: 'E-Commerce API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Mount the feature routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler: never expose internal stack traces
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
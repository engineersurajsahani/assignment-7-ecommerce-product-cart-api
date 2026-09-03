require('dotenv').config();
const express = require('express');
const session = require('express-session');
const logger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(express.json());
app.use(logger);
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
}));

app.get('/', (req, res) => res.json({ message: 'E-Commerce Product Catalog & Shopping Cart API' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(error.message);
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Internal server error' });
});

const port = process.env.PORT || 5000;
if (require.main === module) app.listen(port, () => console.log(`Server running on port ${port}`));
module.exports = app;

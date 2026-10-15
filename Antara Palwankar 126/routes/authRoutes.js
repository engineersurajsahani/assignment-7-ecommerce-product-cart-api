const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const authGuard = require('../middleware/authGuard');

// Customer registration
router.post('/register', register);

// Customer login & session creation
router.post('/login', login);

// Customer logout & session destruction
router.post('/logout', logout);

// Get current logged-in profile
router.get('/me', authGuard, getMe);

module.exports = router;

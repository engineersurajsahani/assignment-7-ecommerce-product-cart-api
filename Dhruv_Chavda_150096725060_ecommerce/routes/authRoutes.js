const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register customer
router.post('/register', authController.register);

// Login customer
router.post('/login', authController.login);

// Logout customer
router.post('/logout', authController.logout);

module.exports = router;

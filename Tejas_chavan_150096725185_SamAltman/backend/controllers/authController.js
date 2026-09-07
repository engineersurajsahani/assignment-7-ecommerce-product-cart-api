// controllers/authController.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const USERS_FILE = 'users.json';
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are all required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'password must be at least 6 characters long.',
      });
    }

    const users = await readData(USERS_FILE);

    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailTaken) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    const { passwordHash: _omit, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: safeUser,
    });
  } catch (error) {
    console.error('[authController.register]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required.',
      });
    }

    const users = await readData(USERS_FILE);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Store a minimal, safe user object on the session.
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: req.session.user,
    });
  } catch (error) {
    console.error('[authController.login]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  if (!req.session) {
    return res.status(200).json({ success: true, message: 'Already logged out.' });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error('[authController.logout]', error);
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
};

/**
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ success: true, data: req.session.user });
  }
  return res.status(401).json({ success: false, message: 'Not authenticated.' });
};

module.exports = { register, login, logout, getMe };



const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const users = await readData('users.json');
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeData('users.json', users);

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const users = await readData('users.json');
    const user = users.find(
      (item) => item.email === email.trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('connect.sid');

    return res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  });
};

const me = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.session.user || null
  });
};

module.exports = { register, login, logout, me };

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'username, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const users = await readData('users.json');
    const normalizedEmail = email.trim().toLowerCase();

    const exists = users.some(user => user.email === normalizedEmail);
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username: username.trim(),
      email: normalizedEmail,
      password: passwordHash,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeData('users.json', users);

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const users = await readData('users.json');
    const user = users.find(u => u.email === email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

module.exports = { register, login, logout };

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const USERS_FILE = 'users.json';

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username, email, and password are required.'
      });
    }

    const users = await readData(USERS_FILE);

    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required.'
      });
    }

    const users = await readData(USERS_FILE);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.status(200).json({
      message: 'Login successful.',
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const logout = async (req, res) => {
  if (!req.session) {
    return res.status(200).json({ message: 'Logged out successfully.' });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error', message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
};

module.exports = { register, login, logout };

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters.'
      });
    }

    const users = await readData('users.json');

    const existingUser = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        message: 'Email is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeData('users.json', users);

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const users = await readData('users.json');

    const user = users.find(
      item => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
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
    res.status(500).json({ message: 'Server error.' });
  }
};

const logout = (req, res) => {
  req.session.destroy(error => {
    if (error) {
      return res.status(500).json({
        message: 'Could not logout.'
      });
    }

    res.status(200).json({
      message: 'Logout successful.'
    });
  });
};

module.exports = { register, login, logout };
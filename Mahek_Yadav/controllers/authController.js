const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'username, email and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters.'
      });
    }

    const users = await readData('users.json');

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `usr_${uuidv4().split('-')[0]}`,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData('users.json', users);

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while registering user.',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'email and password are required.'
      });
    }

    const users = await readData('users.json');

    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      message: 'Login successful.',
      user: req.session.user
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while logging in.',
      error: error.message
    });
  }
};

const logout = (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      message: 'Logged out successfully.'
    });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: 'Unable to logout.'
      });
    }

    res.clearCookie('connect.sid');

    return res.status(200).json({
      message: 'Logged out successfully.'
    });
  });
};

module.exports = {
  register,
  login,
  logout
};

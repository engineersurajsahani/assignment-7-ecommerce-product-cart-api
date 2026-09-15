const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const USERS_FILE = 'users.json';

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username is required and cannot be empty.'
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    const users = await readData(USERS_FILE);

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail || u.username.toLowerCase() === normalizedUsername.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or username already exists.'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: userSafe
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = await readData(USERS_FILE);

    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
      message: 'Logged in successfully.',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
};

const logout = (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({
        success: false,
        message: 'Could not log out, please try again.'
      });
    }

    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
};

module.exports = {
  register,
  login,
  logout
};

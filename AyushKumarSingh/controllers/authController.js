
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const USERS_FILE = 'users.json';

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email and password are all required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'password must be at least 6 characters long',
      });
    }

    const users = await readData(USERS_FILE);

    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    const { password: _pw, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const users = await readData(USERS_FILE);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: req.session.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const logout = (req, res) => {
  if (!req.session) {
    return res.status(200).json({ success: true, message: 'Already logged out' });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};

module.exports = { register, login, logout };

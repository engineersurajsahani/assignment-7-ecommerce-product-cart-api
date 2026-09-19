const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const users = await readData('users.json');
    const exist = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exist) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const usr = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username,
      email: email.toLowerCase(),
      password: hash,
      createdAt: new Date().toISOString()
    };

    users.push(usr);
    await writeData('users.json', users);

    if (req.session) {
      req.session.user = { id: usr.id, username: usr.username, email: usr.email };
    }

    const { password: _, ...safe } = usr;
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: safe
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const users = await readData('users.json');
    const usr = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!usr) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, usr.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userData = { id: usr.id, username: usr.username, email: usr.email };
    if (req.session) {
      req.session.user = userData;
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData
    });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res, next) => {
  try {
    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
      });
    } else {
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
  } catch (err) {
    next(err);
  }
};

const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = { register, login, logout, getMe };

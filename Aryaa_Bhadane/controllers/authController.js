const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, withDataLock } = require('../utils/fileHelper');

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ message: 'username, email, and a password of at least 6 characters are required' });
  }

  try {
    const user = await withDataLock(async () => {
      const users = await readData('users.json');
      const normalizedEmail = email.trim().toLowerCase();
      if (users.some((entry) => entry.email === normalizedEmail)) {
        const error = new Error('Email is already registered');
        error.status = 400;
        throw error;
      }
      const newUser = {
        id: `usr_${uuidv4()}`,
        username: username.trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 12),
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      await writeData('users.json', users);
      return newUser;
    });
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt } });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(401).json({ message: 'Invalid email or password' });
  try {
    const users = await readData('users.json');
    const user = users.find((entry) => entry.email === email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    req.session.user = { id: user.id, username: user.username, email: user.email };
    req.session.save((error) => {
      if (error) return next(error);
      res.json({ message: 'Logged in successfully', user: req.session.user });
    });
  } catch (error) { next(error); }
};

const logout = (req, res, next) => {
  if (!req.session) return res.json({ message: 'Logged out successfully' });
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

module.exports = { register, login, logout };

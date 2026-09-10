const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    const users = await readData('users.json');

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData('users.json', users);

    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({ message: 'User registered successfully', user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const users = await readData('users.json');
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.user = { id: user.id, username: user.username, email: user.email };

    return res.status(200).json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

module.exports = { register, login, logout };

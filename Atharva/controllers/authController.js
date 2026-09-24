const { readData, writeData } = require('../utils/fileHelper');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const users = await readData('users.json');
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${uuidv4()}`,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData('users.json', users);

    res.status(201).json({ success: true, message: 'User registered', userId: newUser.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    const users = await readData('users.json');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.status(200).json({ success: true, message: 'Logged in successfully', user: req.session.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};

module.exports = { register, login, logout };

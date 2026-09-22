const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

const USERS_FILE = 'users.json';

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const register = async (req, res) => {
  const { username, email, password } = req.body || {};

  // 1. Validate required fields
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ message: 'username is required' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'password is required and must be at least 6 characters' });
  }

  // 2. Check whether the email already exists
  const users = await readData(USERS_FILE);
  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // 3. Hash the password using bcryptjs
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create the new user
  const newUser = {
    id: `usr_${uuidv4()}`,
    username: username.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeData(USERS_FILE, users);

  // Never return the password hash in the response
  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
  };

  return res.status(201).json({
    message: 'User registered successfully',
    user: safeUser,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const users = await readData(USERS_FILE);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Compare the password with the stored hash
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Store only safe information in the session
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  return res.status(200).json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
};

const logout = (req, res) => {
  // Destroy the session. If no session exists, it is handled gracefully.
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: 'Logout failed' });
    }

    return res.status(200).json({ message: 'Logout successful' });
  });
};

module.exports = {
  register,
  login,
  logout,
};
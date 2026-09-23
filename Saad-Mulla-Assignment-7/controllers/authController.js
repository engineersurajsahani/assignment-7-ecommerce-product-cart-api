const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileHelper');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const users = await readData('users.json');
  
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already in use' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: `usr_${uuidv4()}`, username, email, password: hashedPassword };
  
  users.push(newUser);
  await writeData('users.json', users);
  
  res.status(201).json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const users = await readData('users.json');
  
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  req.session.user = { id: user.id, username: user.username, email: user.email };
  res.status(200).json({ message: 'Login successful', user: req.session.user });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logged out successfully' });
};
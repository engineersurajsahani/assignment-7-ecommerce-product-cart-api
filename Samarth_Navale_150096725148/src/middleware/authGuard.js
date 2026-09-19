const { readData } = require('../utils/fileHelper');

const authGuard = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    const header = req.headers['authorization'] || req.headers['x-user-id'];
    if (header) {
      const id = header.startsWith('Bearer ') ? header.slice(7).trim() : header.trim();
      if (id) {
        const users = await readData('users.json');
        const usr = users.find((u) => u.id === id || u.email === id || u.username === id);
        if (usr) {
          req.user = { id: usr.id, username: usr.username, email: usr.email };
          if (req.session) req.session.user = req.user;
          return next();
        }
      }
    }

    return res.status(401).json({ success: false, message: 'Unauthorized: Login required' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = authGuard;

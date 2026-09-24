const authGuard = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
};

module.exports = authGuard;

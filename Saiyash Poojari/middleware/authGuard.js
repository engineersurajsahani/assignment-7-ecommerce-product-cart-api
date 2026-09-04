const authGuard = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Please log in to access this resource.'
    });
  }
  next();
};

module.exports = authGuard;

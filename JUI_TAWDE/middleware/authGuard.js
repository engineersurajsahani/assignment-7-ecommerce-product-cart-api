const authGuard = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: 'Unauthorized. Please login first.'
    });
  }

  next();
};

module.exports = authGuard;
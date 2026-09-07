// middleware/authGuard.js
// Blocks access to protected routes (cart, checkout) unless a valid
// session with a logged-in user exists.

const authGuard = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: please log in to access this resource.',
    });
  }
  next();
};

module.exports = authGuard;

const authGuard = (req, res, next) => {
  // Express-session attaches the session object to the request.
  // If the user logged in, req.session.user contains their safe info.
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  next();
};

module.exports = authGuard;
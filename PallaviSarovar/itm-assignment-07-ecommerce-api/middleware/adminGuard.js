const adminGuard = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || req.get('x-admin-key') !== adminKey) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required. Provide the correct x-admin-key header.'
    });
  }

  next();
};

module.exports = adminGuard;

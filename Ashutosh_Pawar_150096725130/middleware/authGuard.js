// Runs before protected routes. Login puts { id, username, email, role } on
// request.session.user; no session user means not logged in.
function authGuard(request, response, next) {
  if (!request.session.user) {
    return response.status(401).json({ message: "Please login first" });
  }
  next();
}

// Runs AFTER authGuard. Only admins may add / edit / delete products.
function adminOnly(request, response, next) {
  if (request.session.user.role !== "admin") {
    return response.status(403).json({ message: "Admins only" });
  }
  next();
}

module.exports = { authGuard, adminOnly };

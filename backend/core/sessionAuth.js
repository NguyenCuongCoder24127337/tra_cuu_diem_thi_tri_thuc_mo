function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  return next();
}

module.exports = {
  requireLogin,
};

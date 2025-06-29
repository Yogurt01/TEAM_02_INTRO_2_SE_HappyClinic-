/**
 * Middleware kiểm tra quyền.
 * Ví dụ:  role('admin','doctor')
 */
module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.redirect('/auth/login');

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).render('error', { msg: 'Access denied' });
  }
  next();
};

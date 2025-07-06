// src/controllers/homeController.js
exports.home = (req, res) => {
  // nếu chưa login, redirect tới login
  if (!req.user) return res.redirect('/auth/login');

  // chuyển hướng về dashboard tương ứng
  switch (req.user.role) {
    case 'admin':
      return res.redirect('/dashboard/admin');
    case 'doctor':
      return res.redirect('/dashboard/doctor');
    default:
      return res.redirect('/dashboard/patient');
  }
};

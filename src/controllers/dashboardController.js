
exports.admin = (req, res) => {
  res.render('adminManager', { user: req.user });
};

exports.doctor = (req, res) => {
  res.render('doctorDashboard', { user: req.user });
};

exports.patient = (req, res) => {
  res.render('patientDashboard', { user: req.user });
};

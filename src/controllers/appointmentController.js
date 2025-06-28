const Appointment = require('../models/appointment');

module.exports.renderAppointmentForm = (req, res) => {
  res.render('appointment', {
    errors: [],        // bạn có thể bỏ nếu không dùng
    error: null,       // THÊM DÒNG NÀY
    user: req.user
  });
};

module.exports.createAppointment = async (req, res) => {
  const { username, email, phone, doctor, department, date, time, symptoms } = req.body;

  try {
    // Lưu lịch khám vào cơ sở dữ liệu
    const newAppointment = new Appointment({
      username,
      email,
      phone,
      doctor,
      department,
      date,
      time,
      symptoms,
    });

    await newAppointment.save();
    res.redirect('/appointments/confirmation');  // Chuyển hướng đến trang xác nhận

  } catch (err) {
    console.error(err);
    res.status(500).send('Đặt lịch khám thất bại');
  }
};
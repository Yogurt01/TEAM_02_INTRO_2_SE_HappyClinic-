const Appointment = require('../models/appointment');

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
const Appointment = require('../models/appointment');

exports.getTodayAppointmentsByDoctor = async (req, res) => {
  try {
    const doctor = req.username; // Giả sử bạn đã gán username vào req (middleware auth)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bắt đầu ngày
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Kết thúc ngày

    const appointments = await Appointment.find({
      doctor: doctor,
      date: { $gte: today, $lt: tomorrow },
    });

    res.render('doctorAppointment', { doctor, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

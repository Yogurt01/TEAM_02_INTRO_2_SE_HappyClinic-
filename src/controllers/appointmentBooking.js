const Appointment = require('../models/appointment');
const User = require('../models/user');

exports.renderForm = async (req, res) => {
  const doctors = await User.find({ role: 'doctor' });
  res.render('appointmentBooking', { doctors, user: req.user });
};

exports.createAppointment = async (req, res) => {
  const _email = req.user.email;
  const currUser = await User.findOne({ email: _email });
  const { date, time, doctor_email, note } = req.body;

  const doctor = await User.findOne({ email: doctor_email, role: 'doctor' });
  if (!doctor) return res.status(400).send('Doctor not found.');

  // Count current appointments on that date
  const count = await Appointment.countDocuments({
    doctor_email,
    date: new Date(date),
    status: 'Scheduled'
  });

  if (count >= doctor.limitation) {
    return res.status(400).send('Doctor has reached their appointment limit for this date.');
  }

  const user = req.user; // from middleware like passport or session

  const appointment = new Appointment({
    username: currUser.username,
    email: currUser.email,
    phone: currUser.phone,
    doctor: doctor.username,
    doctor_email,
    department: doctor.department,
    date: new Date(date),
    time,
    note,
    price: '200000' // or fetch from doctor info or department
  });

  await appointment.save();
  res.render('appoinmentConfirmation', { appointment });
};

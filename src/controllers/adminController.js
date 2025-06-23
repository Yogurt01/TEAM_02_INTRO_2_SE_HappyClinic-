const User = require('../models/user');
const Payment = require('../models/payment')
const nodemailer = require('nodemailer')
const Appointment = require('../models/appointment')
require('dotenv')
// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isBanned: true });
  res.redirect('/admin/users');
};

exports.unbanUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isBanned: false });
  res.redirect('/admin/users');
};

exports.postUserManager = async(req,res)=>{
    try {
        const users = await User.find();
        res.render('userManagement', { users });
    } catch (error) {
        res.status(500).send('Error loading user management page.');
    }
}

exports.postPaymentManagement = async (req, res) => {
  const payments = await Payment.find();
  const mapped = payments.map(p => ({
    _id: p._id,
    userEmail: p.email,
    amount: p.amount,
    status: p.status
  }));
  res.render('paymentManager', { payments: mapped });
};

exports.confirmPayment = async (req, res) => {
    await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'Paid' });
    const payment = await Payment.findOne({_id: req.params.paymentId})
    console.log(payment)
    const transporter = nodemailer.createTransport({
            service: 'gmail',
                auth: {
                user: process.env.EMAIL_USER, // email
                pass: process.env.EMAIL_PASS, // email password
                },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: payment.email,
        subject: 'Xác nhận thanh toán',
        text: `Chào bạn,\n\nChúng tôi xác nhận rằng bạn đã thanh toán thành công số tiền ${payment.amount} VND.\n\nCảm ơn bạn đã sử dụng dịch vụ của chúng tôi.\n\nTrân trọng,\nHappyClinic`
    };
    await transporter.sendMail(mailOptions);
    res.redirect('/admin/payments');
};

exports.cancelPayment = async (req, res) => {
  await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'Failed' });
  res.redirect('/admin/payments');
};

// GET: List all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: -1 });
    res.render('appointmentManager', { appointments });
  } catch (err) {
    res.status(500).send('Lỗi khi tải danh sách lịch hẹn');
  }
};

// GET: Show details for one appointment (form for CRUD)
exports.getAppointmentDetail = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).send('Không tìm thấy lịch hẹn');
    }
    res.render('appointmentDetails', { appointment, error: null, success: null });
  } catch (err) {
    res.status(500).send('Lỗi khi tải chi tiết lịch hẹn');
  }
};

// POST: Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/appointment/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Lỗi khi cập nhật lịch hẹn');
  }
};

// POST: Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.redirect('/appointment');
  } catch (err) {
    res.status(500).send('Lỗi khi xoá lịch hẹn');
  }
};

// POST: Create new appointment (optional)
exports.createAppointment = async (req, res) => {
  try {
    await Appointment.create(req.body);
    res.redirect('/appointments');
  } catch (err) {
    res.status(500).send('Lỗi khi tạo lịch hẹn');
  }
};


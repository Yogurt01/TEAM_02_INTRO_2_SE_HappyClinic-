const User = require('../models/user');
const Payment = require('../models/payment')
const nodemailer = require('nodemailer')
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
  res.redirect('/admin/manage-users');
};

exports.unbanUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isBanned: false });
  res.redirect('/admin/manage-users');
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
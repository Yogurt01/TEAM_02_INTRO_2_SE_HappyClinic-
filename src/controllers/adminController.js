const User = require('../models/user');
const Payment = require('../models/payment')
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
  res.redirect('/admin/payments');
};

exports.cancelPayment = async (req, res) => {
  await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'Failed' });
  res.redirect('/admin/payments');
};
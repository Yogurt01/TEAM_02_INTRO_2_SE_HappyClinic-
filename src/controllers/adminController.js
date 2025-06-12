const User = require('../models/user');

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
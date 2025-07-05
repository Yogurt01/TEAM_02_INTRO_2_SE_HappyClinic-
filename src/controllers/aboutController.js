const User = require('../models/user');

exports.about = async (req, res) => {
  try {
    // req.user đã có id, email, username, role
    // Lấy full document để có các trường thêm như birth, gender, address…
    const user = await User.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).send('User not found');

    res.render('about', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

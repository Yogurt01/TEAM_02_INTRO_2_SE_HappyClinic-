const User = require('../models/user');

/**
 * GET /profile
 * Hiển thị trang Profile với dữ liệu user hiện tại.
 */
exports.getProfile = async (req, res) => {
  try {
    // authenticateToken đã gán req.user = { id, username }

    const userEmail = req.user.email;
    console.log(userEmail)
    if (!userEmail) {
      return res.redirect('/auth/login');
    }

    // Lấy toàn bộ document user (bao gồm nested address)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return res.redirect('/auth/login');
    }

    // Nếu user.address chưa có (trường hợp cũ chưa điền), khởi một object trống để view không lỗi
    if (!user.address) {
      user.address = {
        houseNumber: '',
        street: '',
        ward: '',
        district: '',
        city: ''
      };
    }

    // Render view 'profile.ejs', truyền vào `user`, `error`/`success` ban đầu là null
    return res.render('profile', {
      user,
      error: null,
      success: null
    });
  } catch (err) {
    console.error('Lỗi getProfile:', err);
    return res.redirect('/');
  }
};


/**
 * POST /profile/edit
 * Xử lý form edit profile.
 */
exports.postEditProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.redirect('/auth/login');
    }

    // Lấy tất cả trường từ form
    const {
      fullname,
      birth,
      email,
      gender,
      phone,
      houseNumber,
      street,
      ward,
      district,
      city
    } = req.body;

    // 1) Kiểm tra email có bị trùng với user khác không
    const existingEmailUser = await User.findOne({
      email: email,
      _id: { $ne: userId }
    });
    if (existingEmailUser) {
      const user = await User.findById(userId).lean();
      return res.render('profile', {
        user,
        error: 'Email này đã được sử dụng bởi người khác.',
        success: null
      });
    }

    // 2) Kiểm tra phone có bị trùng với user khác không
    const existingPhoneUser = await User.findOne({
      phone: phone,
      _id: { $ne: userId }
    });
    if (existingPhoneUser) {
      const user = await User.findById(userId).lean();
      return res.render('profile', {
        user,
        error: 'Số điện thoại này đã được sử dụng bởi người khác.',
        success: null
      });
    }

    // 3) Cập nhật vào database
    await User.findByIdAndUpdate(userId, {
      fullname,
      birth,
      email,
      gender,
      phone,
      address: {
        houseNumber,
        street,
        ward,
        district,
        city
      }
    });

    // 4) Lấy lại dữ liệu user mới để render
    const updatedUser = await User.findById(userId).lean();
    return res.render('profile', {
      user: updatedUser,
      error: null,
      success: 'Cập nhật thông tin thành công!'
    });
  } catch (err) {
    console.error('Lỗi postEditProfile:', err);
    return res.redirect('/');
  }
};






const Announcement = require('../models/announcement');

// 📋 Hiển thị danh sách thông báo
exports.getAllAnnouncements = async (req, res) => {
  try {
    let all = await Announcement.find().sort({ date: -1 });
    // Nếu cơ sở dữ liệu trống, chèn mẫu tin
    if (all.length === 0) {
      const exampleNews = {
        title: "Thứ trưởng Bộ Y tế Lê Đức Luận tiếp đoàn UNDP và WHO",
        content: "Ngày 16/6/2025, tại trụ sở Bộ Y tế, Thứ trưởng Lê Đức Luận đã tiếp và làm việc với Đoàn Cơ quan Thường trú Chương trình Phát triển Liên Hợp Quốc (UNDP) và Tổ chức Y tế Thế giới (WHO) tại Việt Nam.",
        category: "event",
        author: "Bộ Y Tế",
        imageUrl: "https://moh.gov.vn/documents/174521/2590201/16.6.2025+TT+Luan+1.jpg/ead9d5a0-8078-4247-b2f0-47a7e7308d0b?t=1750122608411",
        link: "https://moh.gov.vn/tin-noi-bat/-/asset_publisher/3Yst7YhbkA5j/content/thu-truong-bo-y-te-le-uc-luan-tiep-oan-undp-va-who",
        date: new Date("2025-06-17T00:00:00.000Z")
      };

      await Announcement.create(exampleNews);
      all = [exampleNews]; // Gán lại để hiển thị ngay
    }
    // Tách tin tức và thông báo theo category
    const news = all.filter(item => item.category === 'event' || item.category === 'promotion');
    const notices = all.filter(item => item.category === 'service');

    res.render('announcement', {
      news,
      notices,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server khi tải danh sách thông báo.');
  }
};


// ➕ Hiển thị form thêm mới
exports.showAddForm = (req, res) => {
  res.render('addAnnouncement', {
    editMode: false,
    announcement: {},
    user: req.user
  });
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, author, imageUrl, link } = req.body;
    await Announcement.create({ title, content, category, author, imageUrl, link });
    res.redirect('/announcement');
  } catch (err) {
    console.error('Lỗi khi thêm thông báo:', err);
    res.render('addAnnouncement', {
      editMode: false,
      announcement: req.body,
      error: 'Có lỗi xảy ra khi đăng tin. Vui lòng kiểm tra lại.',
      user: req.user
    });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, content, category, author, imageUrl, link } = req.body;
    await Announcement.findByIdAndUpdate(req.params.id, {
      title, content, category, author, imageUrl, link
    });
    res.redirect('/announcement');
  } catch (err) {
    console.error('Lỗi cập nhật thông báo:', err);
    const announcement = { _id: req.params.id, ...req.body };
    res.render('addAnnouncement', {
      editMode: true,
      announcement,
      error: 'Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.',
      user: req.user
    });
  }
};


// ✏️ Hiển thị form chỉnh sửa
exports.showEditForm = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).lean();
    res.render('addAnnouncement', {
      editMode: true,
      announcement,
      user: req.user
    });
  } catch (err) {
    console.error('Lỗi khi lấy thông báo:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};


// ❌ Xoá thông báo
exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.redirect('/announcement');
  } catch (err) {
    console.error('Lỗi xoá thông báo:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};

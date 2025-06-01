const Availability = require('../models/availability');

// Hiển thị danh sách lịch khám, có filter trạng thái
exports.getAvailability = async (req, res) => {
  try {
    const filterStatus = req.query.filterStatus || 'all';
    let query = {};
    if (filterStatus === 'checked') query.isChecked = true;
    else if (filterStatus === 'unchecked') query.isChecked = false;

    const slots = await Availability.find(query)
      .sort({ date: 1, startTime: 1 }) // Sắp xếp theo ngày tăng dần, rồi theo giờ bắt đầu tăng dần
      .lean();

    res.render('availability', {
      slots,
      filterStatus,
      error: null,
      slotId: null,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error(err);
    res.render('availability', {
      slots: [],
      filterStatus: 'all',
      error: 'Lỗi khi tải dữ liệu lịch khám',
      success: null,
    });
  }
};

// Thêm lịch khám mới
exports.postAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, patientName, patientAge, symptoms } = req.body;
    const slots = await Availability.find({}).lean();
    if (!date || !startTime || !endTime || startTime >= endTime) {
      return res.render('availability', {
        slots: await Availability.find({}).lean(),
        filterStatus: 'all',
        error: 'Dữ liệu không hợp lệ: ngày, thời gian bắt đầu và kết thúc',
        slotId: null
        });
    }

    // Kiểm tra trùng lịch trong cùng ngày
    const overlappingSlot = await Availability.findOne({
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlappingSlot) {
      return res.render('availability', {
        slots: await Availability.find({}).lean(),
        filterStatus: 'all',
        error: 'Khung giờ bị trùng với lịch khám đã có',
        slotId: null
      });
    }
    await Availability.create({
      date,
      startTime,
      endTime,
      patientName,
      patientAge,
      symptoms,
      isChecked: false, // mặc định chưa khám
    });

    res.redirect('/auth/availability');
  } catch (err) {
    console.error(err);
    res.render('availability', {
      slots: [],
      filterStatus: 'all',
      error: 'Lỗi khi thêm lịch khám',
    });
  }
};

// Đánh dấu đã khám
exports.markChecked = async (id) => {
  await Availability.findByIdAndUpdate(id, { isChecked: true });
};

// Xóa lịch khám
exports.deleteAvailability = async (id) => {
  await Availability.findByIdAndDelete(id);
};

// Sửa lịch khám
exports.editAvailability = async (id, data) => {
  const { date, startTime, endTime, patientName, patientAge, symptoms } = data;

  if (!date || !startTime || !endTime || startTime >= endTime) {
    throw new Error("Dữ liệu không hợp lệ");
  }

  await Availability.findByIdAndUpdate(id, {
    date,
    startTime,
    endTime,
    patientName,
    patientAge,
    symptoms,
  });
};

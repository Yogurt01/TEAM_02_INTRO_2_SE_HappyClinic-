const Doctor = require('../models/doctor');

// Lọc bác sĩ theo chuyên khoa, địa điểm, trạng thái
exports.searchDoctors = async (req, res) => {
  try {
    const { specialty, location, available } = req.query;
    const query = {};

    if (specialty) query.specialty = new RegExp(specialty, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (available === 'true') query.available = true;
    else if (available === 'false') query.available = false;

    const doctors = await Doctor.find(query).lean();

    res.render('doctor-list', {
      doctors,
      filter: {
        specialty,
        location,
        available,
      },
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render('doctor-list', {
      doctors: [],
      filter: {},
      error: 'Lỗi khi tìm kiếm bác sĩ.',
    });
  }
};

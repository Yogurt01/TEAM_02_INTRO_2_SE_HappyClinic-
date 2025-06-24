const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');
const Availability = require('../models/availability');

// [GET] /patientSearch?code=...
exports.searchPatients = async (req, res) => {
  const filter = req.query || {};
  let query = {};

  if (filter.code) {
    query.code = new RegExp(filter.code, 'i');
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query).skip(skip).limit(limit).lean();

  const totalPages = Math.ceil(total / limit);

  res.render('patientSearch', {
    patients,
    filter,
    page,
    totalPages
  });
};

// [GET] /patientSearch/:patientCode
exports.getByPatientCode = async (req, res) => {
  try {
    const { patientCode } = req.params;

    const patient = await Patient.findOne({ code: patientCode }).lean();
    if (!patient) {
      return res.render('medicalHistory', {
        patient: null,
        records: [],
        message: null,
        error: `Không tìm thấy bệnh nhân với mã ${patientCode}`
      });
    }

    const records = await MedicalRecord.find({ patientCode }).lean();

    // Gắn trạng thái từ Availability
    const enhancedRecords = await Promise.all(records.map(async rec => {
      const avail = await Availability.findOne({ appointmentCode: rec.appointmentCode }).lean();
      return {
        ...rec,
        isChecked: avail?.isChecked || false
      };
    }));

    // Ưu tiên chưa khám
    enhancedRecords.sort((a, b) => a.isChecked - b.isChecked);

    return res.render('medicalHistory', {
      patient,
      records: enhancedRecords,
      message: req.query.message || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error(err);
    return res.render('medicalHistory', {
      patient: null,
      records: [],
      message: null,
      error: 'Lỗi khi truy xuất hồ sơ bệnh án'
    });
  }
};
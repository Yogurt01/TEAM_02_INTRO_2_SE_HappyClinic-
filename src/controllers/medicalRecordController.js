const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');
const Availability = require('../models/availability');

exports.getByPatientCode = async (req, res) => {
  try {
    const { patientCode } = req.params;

    const patient = await Patient.findOne({ code: patientCode }).lean();
    if (!patient) {
      return res.render('medicalRecord', {
        patient: null,
        records: [],
        message: null,
        error: `Không tìm thấy bệnh nhân với mã ${patientCode}`
      });
    }

    const records = await MedicalRecord.find({ patientCode }).lean();

    // Gắn thêm isChecked từ Availability vào từng hồ sơ
    const enhancedRecords = await Promise.all(records.map(async rec => {
    const avail = await Availability.findOne({ appointmentCode: rec.appointmentCode }).lean();
      return {
        ...rec,
        isChecked: avail?.isChecked || false
      };
    }));

    // Sắp xếp: hồ sơ chưa khám lên trước
    enhancedRecords.sort((a, b) => a.isChecked - b.isChecked);

    return res.render('medicalRecord', {
      patient,
      records: enhancedRecords,
      message: req.query.message || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error(err);
    return res.render('medicalRecord', {
      patient: null,
      records: [],
      message: null,
      error: 'Lỗi khi truy xuất hồ sơ bệnh án'
    });
  }
};

exports.getByAppointmentCode = async (req, res) => {
  try {
    const { appointmentCode } = req.params;

    const record = await MedicalRecord.findOne({ appointmentCode }).lean();
    if (!record) {
      return res.render('medicalRecord', {
        patient: null,
        records: [],
        message: null,
        error: `Không tìm thấy hồ sơ với mã lịch hẹn ${appointmentCode}`
      });
    }

    const patient = await Patient.findOne({ code: record.patientCode }).lean();

    return res.render('medicalRecord', {
      patient,
      records: [record],
      message: null,
      error: null
    });
  } catch (err) {
    console.error(err);
    return res.render('medicalRecord', {
      patient: null,
      records: [],
      message: null,
      error: 'Lỗi khi truy xuất hồ sơ bệnh án'
    });
  }
};


exports.updateDiagnosis = async (req, res) => {
  try {
    const { patientCode, appointmentCode, note, diagnosis, symptoms } = req.body;

    if (!appointmentCode) {
      throw new Error('Thiếu mã lịch hẹn');
    }

    // Cập nhật hồ sơ bệnh án
    const updated = await MedicalRecord.findOneAndUpdate(
      { appointmentCode },
      { note, diagnosis, symptoms },
      { new: true }
    );

    if (!updated) {
      throw new Error('Không tìm thấy hồ sơ để cập nhật');
    }

    // Cập nhật trạng thái lịch hẹn thành "Đã khám"
    await Availability.findOneAndUpdate(
      { appointmentCode },          // filter
      { isChecked: true },          // update
      { new: true }                 // return the updated doc (handy for logging)
    );

    return res.redirect(`/auth/medicalRecord/${patientCode}?message=` + encodeURIComponent('Cập nhật thành công'));

  } catch (err) {
    console.error(err);
    return res.redirect(`/auth/medicalRecord/${req.body.patientCode}?error=` + encodeURIComponent(err.message || 'Lỗi khi cập nhật'));
  }
};

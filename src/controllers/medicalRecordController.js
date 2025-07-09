const Patient = require('../models/patient');
const MedicalRecord = require('../models/medicalRecord');
const Availability = require('../models/availability');
const MedicalForm = require('../models/medForm');

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

    // Đồng bộ hồ sơ từ các phiếu khám
    const medForms = await MedicalForm.find({ patientEmail: patient.email }).lean();

    for (const form of medForms) {
      if (!form.appointmentCode) continue;

      await MedicalRecord.findOneAndUpdate(
        { appointmentCode: form.appointmentCode },
        {
          patientCode: patient.code,
          symptoms: form.symptoms,
          diagnosis: form.predictedDisease,
          note: 'Đồng bộ từ phiếu khám',
          department: 'Tự động',
          code: `MR-${form.appointmentCode}`,
          medicines: form.medicines // thêm trường thuốc vào hồ sơ
        },
        { upsert: true }
      );
    }

    // Truy vấn lại toàn bộ hồ sơ bệnh án sau đồng bộ
    const records = await MedicalRecord.find({ patientCode }).lean();

    const enhancedRecords = await Promise.all(records.map(async rec => {
      const avail = await Availability.findOne({ appointmentCode: rec.appointmentCode }).lean();
      return {
        ...rec,
        isChecked: avail?.isChecked || false
      };
    }));

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

    return res.redirect(`/auth/medicalRecord/${patientCode}?message=` + encodeURIComponent('Cập nhật thành công'));

  } catch (err) {
    console.error(err);
    return res.redirect(`/auth/medicalRecord/${req.body.patientCode}?error=` + encodeURIComponent(err.message || 'Lỗi khi cập nhật'));
  }
};

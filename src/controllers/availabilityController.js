const Availability = require('../models/availability');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const MedicalRecord = require('../models/medicalRecord');
// Hiển thị danh sách lịch khám, có filter trạng thái

exports.getAvailability = async (req, res) => {
  try {
    let filterDate;
    if (typeof req.query.filterDate === 'undefined') {
      // Lần đầu truy cập: mặc định hôm nay
      filterDate = new Date().toISOString().slice(0, 10);
    } else {
      // Nếu đã lọc (kể cả lọc rỗng), giữ nguyên giá trị
      filterDate = req.query.filterDate;
    }

    const filterEmail = req.query.filterEmail || '';

    await syncAppointmentsToAvailability();
    let query = {};
    if (filterDate) {
      query.date = filterDate;
    }


    // Nếu có filter theo email bệnh nhân
    let patientMap = {};
    if (filterEmail) {
      const patients = await Patient.find({ email: filterEmail }).lean();
      const patientCodes = patients.map(p => p.code);
      if (patientCodes.length > 0) {
        query.patientCode = { $in: patientCodes };
        patientMap = Object.fromEntries(patients.map(p => [p.code, p]));
      } else {
        // Không tìm thấy ai, trả về danh sách trống
        return res.render('availability', {
          slots: [],
          filterDate,
          filterEmail,
          error: null,
        });
      }
    }

    // Lấy danh sách lịch khám kèm thông tin bệnh nhân
    const rawSlots = await Availability.find(query).sort({ date: 1, startTime: 1 }).lean();

    // Gắn thêm thông tin bệnh nhân nếu có filterEmail
    const slots = await Promise.all(rawSlots.map(async slot => {
      // Lấy thông tin bệnh nhân từ map hoặc DB
      const patient = patientMap[slot.patientCode] || await Patient.findOne({ code: slot.patientCode }).lean();

      // Lấy thông tin bác sĩ từ bảng Appointment (dựa trên email + phone + date + time)
      //let doctorName = 'Không rõ';
      if (patient) {
        const appointment = await Appointment.findOne({
          email: patient.email,
          phone: patient.phone,
          date: new Date(slot.date),
          time: slot.startTime
        }).lean();

        //doctorName = appointment?.doctor || 'Không rõ';
      }

      return {
        ...slot,
        patient,
        //doctorName
      };
    }));



    res.render('availability', {
      slots,
      filterDate,
      filterEmail,
      error: null
    });

  } catch (err) {
    console.error(err);
    res.render('availability', {
      slots: [],
      filterDate: new Date().toISOString().slice(0, 10),
      filterEmail: '',
      error: 'Lỗi khi tải dữ liệu lịch khám'
    });
  }
};




async function generateCode(model, prefix, padLength, codeField = 'code') {
  let codeNumber = 1;

  const latestDoc = await model.findOne()
    .sort({ [codeField]: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });

  if (latestDoc && typeof latestDoc[codeField] === 'string' && latestDoc[codeField].startsWith(prefix)) {
    const numericPart = latestDoc[codeField].slice(prefix.length);
    const parsed = parseInt(numericPart, 10);
    if (!isNaN(parsed)) {
      codeNumber = parsed + 1;
    }
  }

  return prefix + codeNumber.toString().padStart(padLength, '0');
}



async function syncAppointmentsToAvailability() {
  try {
    const appointments = await Appointment.find({ status: 'Scheduled' }).lean();

    for (const appt of appointments) {
      const apptDate = appt.date.toISOString().slice(0, 10);
      const apptTime = appt.time;

      let patient = await Patient.findOne({
        email: appt.email,
        phone: appt.phone
      }).lean();

      let patientCode = patient?.code;

      let exists = false;

      if (patient) {
        exists = await Availability.exists({
          date: apptDate,
          startTime: apptTime,
          patientCode: patient.code
        });
      }

      if (exists) continue;

      // Nếu chưa có bệnh nhân, tạo mới
      if (!patient) {
        patientCode = await generateCode(Patient, 'BN', 4);
        patient = await Patient.create({
          code: patientCode,
          fullName: appt.username,
          phone: appt.phone,
          email: appt.email,
          gender: 'Chưa rõ',
          dob: '2000-01-01',
          address: 'Chưa rõ'
        });
      }

      const appointmentCode = await generateCode(Availability, 'AP', 4, 'appointmentCode');

      await Availability.create({
        date: apptDate,
        startTime: apptTime,
        endTime: addMinutes(apptTime, 30),
        patientName: appt.username,
        patientBirth: patient.dob || '2000-01-01',
        patientGender: patient.gender || 'Chưa rõ',
        symptoms: appt.note || '',
        patientEmail: patient.email,
        patientPhone: patient.phone,
        patientAddress: patient.address || 'Chưa rõ',
        isChecked: false,
        patientCode: patient.code,
        appointmentCode
      });

      await MedicalRecord.create({
        code: await generateCode(MedicalRecord, 'BA', 4),
        patientCode: patient.code,
        appointmentCode,
        department: 'Chưa xác định',
        date: new Date(),
        diagnosis: 'Chưa xác định',
        note: 'Chưa xác định',
        symptoms: appt.note || ''
      });
    }

    console.log("Đồng bộ thành công: chỉ thêm lịch mới chưa có.");
  } catch (err) {
    console.error("Lỗi khi đồng bộ:", err);
  }
}



// Hàm thêm: cộng thêm phút vào chuỗi giờ 'HH:mm'
function addMinutes(time, minsToAdd) {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + minsToAdd);
  return date.toTimeString().slice(0, 5);
}

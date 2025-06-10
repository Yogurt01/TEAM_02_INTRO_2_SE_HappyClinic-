const Availability = require('../models/availability');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const MedicalRecord = require('../models/medicalRecord');
// Hiển thị danh sách lịch khám, có filter trạng thái

exports.getAvailability = async (req, res) => {
  try {

    //await syncAppointmentsToAvailability();
    const filterStatus = req.query.filterStatus || 'all';
    let query = {};
    if (filterStatus === 'checked') query.isChecked = true;
    else if (filterStatus === 'unchecked') query.isChecked = false;

    /*const slots = await Availability.find(query)
    
      .sort({ date: 1, startTime: 1 }) // Sắp xếp theo ngày tăng dần, rồi theo giờ bắt đầu tăng dần
      .lean();
    */
    const slots = await getPopulatedSlots(query);

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
    const { 
      date, 
      startTime,
      endTime, 
      patientName, 
      patientBirth, 
      patientGender,
      symptoms, 
      patientEmail, 
      patientPhone, 
      patientAddress 
    } = req.body;

    if (!date || !startTime || !endTime || timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return res.render('availability', {
        slots: await getPopulatedSlots(),
        filterStatus: 'all',
        error: 'Dữ liệu không hợp lệ: ngày, thời gian bắt đầu và kết thúc',
        slotId: null
        });
    }

    // Kiểm tra trùng lịch khám
    const overlappingSlot = await Availability.findOne({
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlappingSlot) {
      return res.render('availability', {
        slots: await getPopulatedSlots(),
        filterStatus: 'all',
        error: 'Khung giờ bị trùng với lịch khám đã có',
        slotId: null
      });
    }


    // Kiểm tra bệnh nhân có tồn tại chưa
    let existingPatient = await Patient.findOne({ fullName: patientName, phone: patientPhone, dob: patientBirth, email: patientEmail });
    let patientCode;

    if (!existingPatient) {
      // Nếu chưa có → tạo mã mới
      const newCode = await generateCode(Patient, 'BN', 4);

      // Thêm vào bảng Patient
      const newPatient = await Patient.create({
        code: newCode,
        fullName: patientName,
        phone: patientPhone,
        address: patientAddress,
        email: patientEmail,
        dob: patientBirth,
        gender: patientGender    
      });

      patientCode = newPatient.code;
    } else {
      // Nếu có rồi → dùng code hiện có
      patientCode = existingPatient.code;
    }

    //Tạo mã lịch đăng ký khám
    const appointmentCode = await generateCode(Availability, 'AP', 4, 'appointmentCode');
    // Tạo lịch khám'
    await Availability.create({
      date,
      startTime,
      endTime,
      patientName,
      patientBirth,
      patientGender,
      symptoms,
      patientEmail,
      patientPhone,
      patientAddress,
      isChecked: false,
      patientCode,
      appointmentCode
    });

    // Chuyển sang Appointment
    await Appointment.create({
      username: patientName,
      email: patientEmail,
      phone: patientPhone,
      doctor: req.user?.fullName || 'Bác sĩ không rõ',  // Cần có thông tin bác sĩ từ session hoặc login
      department: req.user?.department || '',           // Nếu có
      date: new Date(date),
      time: startTime,
      note: symptoms,
      price: '500000',                                  // Gán cứng, hoặc cấu hình/phân loại theo bác sĩ/khoa
      status: 'Scheduled'
    });

    await MedicalRecord.create({
      code: await generateCode(MedicalRecord, 'BA', 4), 
      patientCode,
      appointmentCode,
      department: 'Chưa xác định',//doctor.department, 
      date: new Date(), 
      diagnosis: 'Chưa xác định', 
      note: 'Chưa xác định',       
      symptoms
    });

    res.redirect('/auth/availability?success=1');
  } catch (err) {
    console.error(err);
    const slots = await Availability.find({}).lean();
    res.render('availability', {
      slots,
      filterStatus: 'all',  
      error: 'Lỗi khi thêm lịch khám',
    });
  }
};

// Đánh dấu đã khám
exports.markChecked = async (appointmentCode) => {
  await Availability.findOneAndUpdate({ appointmentCode }, { isChecked: true });
};

exports.deleteAvailability = async (appointmentCode) => {
  const result = await Availability.findOneAndDelete({ appointmentCode });
  if (!result) {
    console.warn("Không tìm thấy lịch khám với mã: ", appointmentCode);
    throw new Error("Không tìm thấy lịch khám");
  }
};


// Sửa lịch khám
exports.editAvailability = async (appointmentCode, data) => {
  const { date, startTime, endTime, patientName, patientGender, patientBirth, symptoms, patientEmail, patientPhone, patientAddress } = data;

  if (!date || !startTime || !endTime || startTime >= endTime) {
    throw new Error("Dữ liệu không hợp lệ");
  }

  const slot = await Availability.findOne({ appointmentCode }).lean();
  if (!slot || !slot.patientCode) {
    throw new Error("Không tìm thấy lịch khám hoặc mã bệnh nhân");
  }

  await Promise.all([
    Availability.findOneAndUpdate(
      { appointmentCode }, 
      {
        date,
        startTime,
        endTime,
        patientName,
        patientBirth,
        symptoms
      }
    ),
    Patient.findOneAndUpdate(
      { code: slot.patientCode },
      {
        fullName: patientName,
        gender: patientGender,
        dob: patientBirth,
        email: patientEmail,
        phone: patientPhone,
        address: patientAddress
      }
    )
  ]);
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

function timeToMinutes(t) {
  const [hours, minutes] = t.split(':').map(Number);
  return hours * 60 + minutes;
}

async function getPopulatedSlots(filter = {}) {
  const rawSlots = await Availability.find(filter).lean();
  return await Promise.all(rawSlots.map(async slot => {
    const patient = await Patient.findOne({ code: slot.patientCode }).lean();
    return { ...slot, patient };
  }));
}

async function syncAppointmentsToAvailability() {
  try {
    const appointments = await Appointment.find().lean();

    for (const appt of appointments) {
      const apptDate = appt.date.toISOString().slice(0, 10);
      const existing = await Availability.findOne({
        date: apptDate,
        startTime: appt.time,
        $or: [
          { patientEmail: appt.email },
          { patientPhone: appt.phone }
        ]
      });

      if (!existing) {
        // Tìm hoặc tạo bệnh nhân
        let patient = await Patient.findOne({ email: appt.email, phone: appt.phone }).lean();
        let patientCode = patient?.code;

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

        await Availability.create({
          date: apptDate,
          startTime: appt.time,
          endTime: addMinutes(appt.time, 30),
          patientName: appt.username,
          patientBirth: patient.dob || '2000-01-01',
          patientGender: patient.gender || 'Chưa rõ',
          symptoms: appt.note || '',
          patientEmail: appt.email,
          patientPhone: appt.phone,
          patientAddress: patient.address || 'Chưa rõ',
          isChecked: false,
          patientCode: patientCode,
          appointmentCode: await generateCode(Availability, 'AP', 4, 'appointmentCode')
        });
      }
    }

    console.log("Đồng bộ lịch hẹn thành công.");
  } catch (err) {
    console.error("Lỗi khi đồng bộ lịch hẹn:", err);
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

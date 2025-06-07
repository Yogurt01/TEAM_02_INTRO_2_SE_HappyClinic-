const Availability = require('../models/availability');
const Patient = require('../models/patient');

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

    const populatedSlots = await Promise.all(slots.map(async slot => {
      const patient = await Patient.findOne({ code: slot.patientCode }).lean();
      return { ...slot, patient }; // Gắn thêm thông tin bệnh nhân
    }));

    res.render('availability', {
      slots: populatedSlots,
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

    if (!date || !startTime || !endTime || startTime >= endTime) {
      return res.render('availability', {
        slots: await Availability.find({}).lean(),
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
        slots: await Availability.find({}).lean(),
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
      const newCode = await generatePatientCode();

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
    const appointmentCode = await generateAppointmentCode();
    // Tạo lịch khám
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

async function generatePatientCode() {
  let codeNumber = 1;

  // Tìm bệnh nhân có mã lớn nhất
  const latestPatient = await Patient.findOne()
    .sort({ code: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });

  if (latestPatient && latestPatient.code) {
    codeNumber = parseInt(latestPatient.code.slice(2)) + 1;
  }

  const code = 'BN' + codeNumber.toString().padStart(3, '0');
  return code;
  
}

async function generateAppointmentCode() {
  let codeNumber = 1;

  const latestAppointment = await Availability.findOne()
  .sort({ appointmentCode: -1})
  .collation({ locale: 'en_US', numericOrdering: true});

  if (latestAppointment && latestAppointment.appointmentCode) {
    codeNumber = parseInt(latestAppointment.appointmentCode.slice(2)) + 1;
  }

  return 'AP' + codeNumber.toString().padStart(4, '0');

}
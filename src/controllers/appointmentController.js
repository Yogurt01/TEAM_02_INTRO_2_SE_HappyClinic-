const Appointment = require('../models/appointment');
const nodemailer = require('nodemailer');


// Hàm tạo lịch khám
module.exports.createAppointment = async (req, res) => {
  const { username, email, phone, doctor, department, date, time, note, price } = req.body;
  try {
    // Tạo lịch khám mới
    const newAppointment = new Appointment({
      username,
      email,
      phone,
      doctor,
      department,
      date: new Date(date), // Chuyển đổi sang định dạng Date
      time,
      note,
      price
    });
    await newAppointment.save();
    res.status(201).send('Tạo lịch khám thành công!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Tạo lịch khám thất bại!');
  }
};
    
// Hàm gửi email xác nhận lịch khám
module.exports.sendConfirmationEmail = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    // Gửi email xác nhận
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: 'Xác nhận lịch khám tại Happy Clinic',
      text: `Chúng tôi đã nhận được yêu cầu đặt lịch khám với bác sĩ ${appointment.doctor} vào lúc ${appointment.time}, ngày ${appointment.date}.`
    };

    await transporter.sendMail(mailOptions);
    res.send('Xác nhận lịch khám đã được gửi qua email!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gửi email xác nhận thất bại!');
  }
};

// Hàm gửi nhắc nhở lịch khám
module.exports.sendAppointmentReminder = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    // Gửi nhắc nhở qua email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: 'Nhắc nhở lịch khám tại Happy Clinic',
      text: `Đây là lời nhắc nhở lịch khám của bạn với bác sĩ ${appointment.doctor} vào lúc ${appointment.time}, ngày ${appointment.date}. Vui lòng đến đúng giờ!`
    };

    await transporter.sendMail(mailOptions);
    res.send('Nhắc nhở lịch khám đã được gửi qua email!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gửi nhắc nhở thất bại!');
  }
};

const cron = require('node-cron');

// Tạo một Cron Job gửi nhắc nhở trước 1 ngày lịch khám
cron.schedule('0 9 * * *', async () => {
  const appointments = await Appointment.find({ date: { $gte: new Date() } }); // Tìm tất cả các lịch khám chưa qua ngày

  appointments.forEach(async (appointment) => {
    const appointmentDate = new Date(appointment.date);
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24 giờ trước lịch khám

    if (new Date() >= reminderTime) {
      // Gửi nhắc nhở qua email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: appointment.email,
        subject: 'Nhắc nhở lịch khám tại Happy Clinic',
        text: `Đây là lời nhắc nhở lịch khám của bạn với bác sĩ ${appointment.doctor} vào lúc ${appointment.time}, ngày ${appointment.date}. Vui lòng đến đúng giờ!`
      };

      await transporter.sendMail(mailOptions);
    }
  });
});


const twilio = require('twilio');

// Sử dụng Twilio để gửi SMS
const sendSMS = async (phone, message) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};

// Cập nhật hàm gửi nhắc nhở
module.exports.sendAppointmentReminder = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    // Gửi nhắc nhở qua SMS
    const message = `Nhắc nhở lịch khám: Bạn có lịch khám với bác sĩ ${appointment.doctor} vào lúc ${appointment.time}, ngày ${appointment.date}.`;
    await sendSMS(appointment.phone, message);

    res.send('Nhắc nhở lịch khám qua SMS đã được gửi!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gửi nhắc nhở thất bại!');
  }
};

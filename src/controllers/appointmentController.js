const Appointment = require('../models/appointment');
const nodemailer = require('nodemailer');

module.exports.createAppointment = async (req, res) => {
  const { username, email, phone, doctor, department, date, time, note, price } = req.body;

  try {
    // Tạo một lịch khám mới
    const newAppointment = new Appointment({
      username,
      email,
      phone,
      doctor,
      department,
      date,
      time,
      note,
      price,
    });

    await newAppointment.save(); // Lưu lịch khám vào cơ sở dữ liệu

    // Gửi email xác nhận cho bệnh nhân
    sendConfirmationEmail(email, doctor, date, time);

    // Sau khi tạo lịch thành công, chuyển hướng người dùng về trang thông báo
    res.redirect('/appointments/confirmation');
  } catch (err) {
    console.error(err);
    res.status(500).send('Đặt lịch khám thất bại');
  }
};

// Gửi email xác nhận lịch khám
const sendConfirmationEmail = (email, doctor, date, time) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Xác nhận lịch khám',
    text: `Chúng tôi đã nhận được yêu cầu đặt lịch khám với bác sĩ ${doctor} vào lúc ${time}, ngày ${date}.`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error: ', err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// Hàm để hiển thị trang xác nhận lịch hẹn (nếu cần)
module.exports.confirmationPage = (req, res) => {
  res.render('confirmation');  // Tạo view để hiển thị trang xác nhận
};

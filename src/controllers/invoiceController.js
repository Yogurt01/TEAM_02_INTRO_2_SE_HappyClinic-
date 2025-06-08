const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const nodemailer = require('nodemailer');

// Hàm tạo hóa đơn cho một lịch khám
module.exports.createInvoice = async (req, res) => {
  const { appointmentId, amount } = req.body;
  
  try {
    const appointment = await Appointment.findById(appointmentId);
    const patient = await Patient.findById(appointment.patient);
    
    const newInvoice = new Invoice({
      patient: patient._id,
      appointment: appointment._id,
      amount,
      status: 'Unpaid',
    });

    await newInvoice.save();

    res.redirect('/invoices');  // Chuyển hướng đến trang hiển thị hóa đơn
  } catch (err) {
    console.error(err);
    res.status(500).send('Tạo hóa đơn thất bại');
  }
};

// Hàm để xem lịch sử thanh toán của bệnh nhân
module.exports.getBillingHistory = async (req, res) => {
  const patientId = req.user._id;  // Giả sử người dùng đã đăng nhập và thông tin bệnh nhân lưu trong `req.user`
  
  try {
    const invoices = await Invoice.find({ patient: patientId }).populate('appointment').exec();
    res.render('billingHistory', { invoices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Không thể lấy lịch sử thanh toán');
  }
};

// Hàm thanh toán hóa đơn
module.exports.payInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (invoice.status === 'Paid') {
      return res.status(400).send('Hóa đơn này đã được thanh toán');
    }

    invoice.status = 'Paid';
    invoice.paymentDate = new Date();
    await invoice.save();

    // Gửi email xác nhận thanh toán
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: invoice.patient.email,
      subject: 'Xác nhận thanh toán hóa đơn',
      text: `Hóa đơn cho lịch khám với bác sĩ ${invoice.appointment.doctor} đã được thanh toán thành công. Số tiền: ${invoice.amount} VND.`
    };

    await transporter.sendMail(mailOptions);

    res.redirect('/invoices');  // Quay lại trang lịch sử thanh toán
  } catch (err) {
    console.error(err);
    res.status(500).send('Thanh toán hóa đơn thất bại');
  }
};

const HelpRequest = require('../models/helpRequest');
const nodemailer = require('nodemailer');

// Cấu hình transporter cho Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.listRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 }).lean();
    res.render('admin-help-requests', { requests, error: null });
  } catch (err) {
    console.error(err);
    res.render('admin-help-requests', { requests: [], error: 'Lỗi khi tải danh sách câu hỏi' });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const helpRequest = await HelpRequest.findById(id);
    if (!helpRequest) {
      return res.status(404).send('Không tìm thấy câu hỏi');
    }

    helpRequest.answer = answer;
    helpRequest.status = true;
    await helpRequest.save();

    // Gửi email mỗi lần cập nhật
    await transporter.sendMail({
      from: `"Happy Clinic" <${process.env.EMAIL_USER}>`,
      to: helpRequest.email,
      subject: 'Phản hồi câu hỏi từ Happy Clinic',
      html: `
        <p>Xin chào <strong>${helpRequest.name}</strong>,</p>
        <p>Chúng tôi đã nhận được câu hỏi của bạn:</p>
        <blockquote>${helpRequest.question}</blockquote>
        <p>Phản hồi từ Happy Clinic:</p>
        <blockquote style="color: green;"><strong>${answer}</strong></blockquote>
        <p>Trân trọng,<br/>Happy Clinic</p>
      `
    });

    res.redirect('/admin/help-requests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi gửi câu trả lời');
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id).lean();
    if (!helpRequest) {
      return res.status(404).send('Không tìm thấy câu hỏi');
    }
    res.render('admin-edit-answer', { request: helpRequest });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải form chỉnh sửa');
  }
};

const HelpRequest = require('../models/helpRequest');

exports.getHelpForm = (req, res) => {
  res.render('help', { success: null, error: null, formData: {} });
};

exports.submitHelpForm = async (req, res) => {
  const { name, email, phone, question } = req.body;

  if (!name || !email || !phone || !question) {
    return res.render('help', {
      success: null,
      error: 'Vui lòng điền đầy đủ tất cả các trường.',
      formData: { name, email, phone, question }
    });
  }

  try {
    await HelpRequest.create({ name, email, phone, question });
    res.render('help', { success: 'Gửi câu hỏi thành công. Chúng tôi sẽ phản hồi qua email.', error: null, formData: {} });
  } catch (err) {
    console.error(err);
    res.render('help', { success: null, error: 'Đã xảy ra lỗi khi gửi câu hỏi.', formData: { name, email, phone, question } });
  }
};

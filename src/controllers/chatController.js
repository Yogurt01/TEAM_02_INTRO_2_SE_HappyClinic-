// src/controllers/chatController.js
const { generateReply } = require('../config/hf');

exports.getChat = (req, res) => {
  res.render('chat', { user: req.user });
};

exports.postChat = async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập câu hỏi.' });
  }

  try {
    const answer = await generateReply(message);
    return res.json({ answer });
  } catch (err) {
    console.error('Hugging Face error:', err.message);
    return res.status(500).json({ error: 'Dịch vụ Chatbot đang bận, thử lại sau.' });
  }
};

const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },           // Tên người gửi
  email: { type: String, required: true },          // Email liên hệ
  phone: { type: String, required: true },          // Số điện thoại
  question: { type: String, required: true },       // Nội dung câu hỏi
  answer: { type: String },  
  status: { type: Boolean, default: false },        // false = chưa trả lời, true = đã trả lời
  createdAt: { type: Date, default: Date.now }      // Thời gian gửi
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);

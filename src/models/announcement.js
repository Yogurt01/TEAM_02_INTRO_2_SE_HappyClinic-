const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['event', 'service', 'promotion'], required: true },
  imageUrl: { type: String },  // thêm ảnh đại diện nếu cần
  date: { type: Date, default: Date.now },
  author: { type: String, required: true },
  link: String,
});

module.exports = mongoose.model('Announcement', announcementSchema);

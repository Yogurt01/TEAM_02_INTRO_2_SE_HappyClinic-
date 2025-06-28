const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  username: { type: String, required: true },       // Tên người đặt lịch
  email: { type: String, required: true },          // Email để liên kết với Payment
  phone: { type: String, required: true },          // SĐT người đặt lịch
  doctor: { type: String, required: true },
  doctor_email: {type: String, required: true},         // Tên bác sĩ
  department: { type: String },                     // Khoa (nếu có)
  date: { type: Date, required: true },             // Ngày khám
  time: { type: String, required: true },           // Giờ khám
  note: { type: String },                           // Ghi chú (nếu có)
  price: { type: String, required: true },          // Phí khám (để tính payment)
  status: {                                         // Trạng thái lịch hẹn
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.appointments || mongoose.model('appointments', appointmentSchema);

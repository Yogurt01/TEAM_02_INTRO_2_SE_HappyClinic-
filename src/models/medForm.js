const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Tên thuốc
  unit: { type: String, required: true },       // Đơn vị (viên, ống,...)
  quantity: { type: Number, required: true },   // Số lượng
  usage: { type: String, required: true },      // Cách dùng
});

const medicalFormSchema = new mongoose.Schema({
  appointmentCode: { type: String, required: true },
  patientName: { type: String, required: true },
  patientEmail:{ type: String, required: true },
  examinationDate: { type: Date, required: true },         // Ngày khám
  symptoms: { type: String, required: true },              // Triệu chứng
  predictedDisease: { type: String, required: true },      // Dự đoán loại bệnh
  medicines: [medicineSchema],                             // Danh sách thuốc
}, { timestamps: true, collection: 'medForm' });

module.exports = mongoose.model('MedForm', medicalFormSchema);

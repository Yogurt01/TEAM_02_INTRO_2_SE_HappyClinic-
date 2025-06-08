const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },  // Bệnh nhân
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },  // Lịch khám
  amount: { type: Number, required: true },  // Số tiền thanh toán
  status: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Pending'], 
    default: 'Unpaid' 
  },  // Trạng thái thanh toán
  dateIssued: { type: Date, default: Date.now },  // Ngày lập hóa đơn
  paymentDate: { type: Date },  // Ngày thanh toán (nếu có)
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);

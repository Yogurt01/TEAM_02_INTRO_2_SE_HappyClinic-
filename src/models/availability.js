const mongoose = require('mongoose')

const availabilitySchema = new mongoose.Schema({
  date: { type: String, required: true },          // yyyy-mm-dd
  startTime: { type: String, required: true },     // hh:mm
  endTime: { type: String, required: true },       // hh:mm
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  symptoms: { type: String, required: true },
  isChecked: { type: Boolean, default: false },    // trạng thái đã khám
});

module.exports = mongoose.model('Availability', availabilitySchema);
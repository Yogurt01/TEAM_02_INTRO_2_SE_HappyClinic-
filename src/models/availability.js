const mongoose = require('mongoose')

const availabilitySchema = new mongoose.Schema({
  appointmentCode: { type: String, required: true, unique: true },
  date: { type: String, required: true },          // yyyy-mm-dd
  startTime: { type: String, required: true },     // hh:mm
  endTime: { type: String, required: true },       // hh:mm
  patientName: { type: String, required: true },
  patientBirth: { type: String, required: true },
  symptoms: { type: String, required: true },
  patientCode: {type: String, required: true}
});

module.exports = mongoose.model('Availability', availabilitySchema);
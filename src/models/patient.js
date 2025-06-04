const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  fullName: String,
  dob: String,
  gender: String,
  phone: String,
  email: String,
  address: String
});

module.exports = mongoose.model('Patient', patientSchema);

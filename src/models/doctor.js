const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: String, // chuyên khoa
  email: String,
  phone: String,
  location: String,
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);

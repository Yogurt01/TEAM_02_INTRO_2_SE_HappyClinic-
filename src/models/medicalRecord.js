
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    appointmentCode: { type: String, required: true },
    date: {type: Date, required: true},
    department: { type: String, required: true },
    note: { type: String, required: true },
    diagnosis: { type: String, required: true },
    symptoms: { type: String, required: true },
    patientCode: { type: String, required: true }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
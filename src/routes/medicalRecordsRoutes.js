const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// GET: Lấy hồ sơ theo mã bệnh nhân
router.get('/:patientCode', medicalRecordController.getByPatientCode);

// GET: Lấy hồ sơ theo mã lịch hẹn
router.get('/byAppointment/:appointmentCode', medicalRecordController.getByAppointmentCode);

// POST: Cập nhật chẩn đoán
router.post('/update', medicalRecordController.updateDiagnosis);

module.exports = router;

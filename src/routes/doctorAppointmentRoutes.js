const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/doctorAppointment');

// Route xem lịch hẹn hôm nay của bác sĩ
router.get('/today', appointmentController.getTodayAppointmentsByDoctor);


module.exports = router;

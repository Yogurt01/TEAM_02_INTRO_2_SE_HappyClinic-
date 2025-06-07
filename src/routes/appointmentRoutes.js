const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController'); 

// Đặt lịch khám
router.post('/appointments', AppointmentController.createAppointment);

// Xác nhận lịch khám
router.get('/appointments/confirmation', AppointmentController.confirmationPage);

module.exports = router;

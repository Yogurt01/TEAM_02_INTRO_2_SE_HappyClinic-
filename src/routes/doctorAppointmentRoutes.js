const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/doctorAppointment');

const authenticateToken = require('../middlewares/authMiddlesware');
// Route xem lịch hẹn hôm nay của bác sĩ
router.get('/today',authenticateToken, appointmentController.getTodayAppointmentsByDoctor);


module.exports = router;

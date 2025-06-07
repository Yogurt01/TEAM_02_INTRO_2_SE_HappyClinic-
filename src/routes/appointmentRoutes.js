const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController'); 

// Route GET để hiển thị form đặt lịch khám
router.get('/', (req, res) => {
  res.render('appointment');  // Render form appointment.ejs
});

// Route POST để xử lý việc gửi form và tạo lịch khám
router.post('/', AppointmentController.createAppointment);

// Route để gửi email xác nhận lịch khám
router.get('/confirmation/:appointmentId', AppointmentController.sendConfirmationEmail);

// Route để gửi nhắc nhở lịch khám
router.get('/reminder/:appointmentId', AppointmentController.sendAppointmentReminder);

module.exports = router;

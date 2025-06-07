const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');

// GET: Hiển thị form đặt lịch khám
router.get('/', (req, res) => {
  res.render('appointment');  // Render form đặt lịch khám (appointment.ejs)
});

// POST: Xử lý khi người dùng gửi form
router.post('/', AppointmentController.createAppointment);

module.exports = router;

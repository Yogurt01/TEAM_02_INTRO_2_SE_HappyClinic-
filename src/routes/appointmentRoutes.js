// Refactored appointmentRoutes.js with correct MVC separation
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');
const authenticateToken = require('../middlewares/authMiddlesware');

// GET: Hiển thị form đặt lịch khám - đã chuyển render sang controller
router.get('/', authenticateToken, AppointmentController.renderAppointmentForm);

// POST: Xử lý khi người dùng gửi form đặt lịch
router.post('/', authenticateToken, AppointmentController.createAppointment);

module.exports = router;
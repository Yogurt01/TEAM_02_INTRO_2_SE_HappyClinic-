const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentBooking');
const User = require('../models/user');
const authenticateToken = require('../middlewares/authMiddlesware');

router.get('/book', authenticateToken ,appointmentController.renderForm);
router.post('/book', authenticateToken, appointmentController.createAppointment);

module.exports = router;

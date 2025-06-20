const express = require('express');
const router = express.Router();
const medicalFormController = require('../controllers/medFormController');

// Hiển thị form tạo từ appointment
router.get('/create', medicalFormController.renderCreateForm);

// Lưu phiếu sau submit
router.post('/create', medicalFormController.createMedicalForm);

module.exports = router;

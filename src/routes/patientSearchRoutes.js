const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientSearchController');

// [GET] /patientSearch => tìm kiếm bệnh nhân theo mã
router.get('/', controller.searchPatients);

// [GET] /patientSearch/:patientCode => xem lịch sử khám
router.get('/:patientCode', controller.getByPatientCode);

module.exports = router;

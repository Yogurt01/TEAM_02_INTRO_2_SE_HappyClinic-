const express = require('express');
const router = express.Router();
const payment = require('../controllers/paymentController');

router.get('/', payment.showForm);
router.post('/generate', payment.generateQR);

module.exports = router;

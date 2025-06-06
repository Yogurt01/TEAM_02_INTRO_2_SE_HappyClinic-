const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddlesware');
const paymentController = require('../controllers/paymentController');

router.get('/',authenticateToken, paymentController.listPaymentsOfUser);

router.post('/generate-qr',authenticateToken, paymentController.generateQR);

router.post('/confirm',authenticateToken, paymentController.confirmPayment);


module.exports = router;

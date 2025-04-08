const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddlesware');
const otp = require('../controllers/otpController')
const router = express.Router();
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

router.get('/dashboard', authenticateToken);
// OTP Confirmation
router.post('/verify-otp', otp.verifyOTP);
module.exports = router;
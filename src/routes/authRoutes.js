const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddlesware');
const otp = require('../controllers/otpController')
const router = express.Router();
const passport = require("passport");

const jwt = require('../config/jwt');
const availabilityController = require('../controllers/availabilityController');




router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.googleLogin
);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

// OTP Confirmation
router.post('/verify-otp', otp.verifyOTP);
//

module.exports = router;

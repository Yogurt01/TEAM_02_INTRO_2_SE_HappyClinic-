const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddlesware');
const otp = require('../controllers/otpController')
const router = express.Router();
const passport = require("passport");
const jwtLib = require('../config/jwt');
const cookieParser = require('cookie-parser');

router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;

    // Tạo JWT từ user info
    const token = jwtLib.generateToken({ id: user.id, name: user.displayName });

    // Gán JWT vào cookie
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  }
);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

// OTP Confirmation
router.post('/verify-otp', otp.verifyOTP);
module.exports = router;
const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddlesware');
const otp = require('../controllers/otpController')
const router = express.Router();
const passport = require("passport");
const jwtLib = require('../config/jwt');
const availabilityController = require('../controllers/availabilityController');



router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const {user} = req;

    // Tạo JWT từ user info
    const token = jwtLib.generateToken({ id: user.id, name: user.displayName });

    // Gán JWT vào cookie
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'Lax', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

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

router.get('/availability', authenticateToken, availabilityController.getAvailability);

router.post('/availability', authenticateToken, availabilityController.postAvailability);

router.post('/availability/check/:id', authenticateToken, async (req, res) => {
  try {
    await availabilityController.markChecked(req.params.id);
    res.redirect('/auth/availability');
  } catch (err) {
    res.status(500).send("Error marking slot as checked");
  }
});

router.post('/availability/delete/:id', authenticateToken, async (req, res) => {
  try {
    await availabilityController.deleteAvailability(req.params.id);
    res.redirect('/auth/availability');
  } catch (err) {
    res.status(500).send("Error deleting slot");
  }
});

router.post('/availability/edit/:id', authenticateToken, async (req, res) => {
  try {
    await availabilityController.editAvailability(req.params.id, req.body);
    res.redirect('/auth/availability?filterStatus=all')
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing slot");
  }
});

module.exports = router;

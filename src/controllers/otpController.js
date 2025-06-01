const otpStore = require('../models/otpStore')
const { MongoClient } = require('mongodb');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config
require('mongoose')
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.render('otpConfirm', { title: 'OTP Confirmation', email, errorMessage: 'OTP is required.' });
    }
    
    const storedOtp = otpStore.getOtp(email);
    console.log('stored',storedOtp)
    if (!storedOtp) {
      return res.render('otpConfirm', { title: 'OTP Confirmation', email, errorMessage: 'No OTP found or it has expired.' });
    }
  
    if (Date.now() > storedOtp.expiresAt) {
      otpStore.deleteOtp(email);
      return res.render('otpConfirm', { title: 'OTP Confirmation', email, errorMessage: 'OTP has expired.' });
    }
  
    if (parseInt(storedOtp.otp.otp) !== parseInt(otp)) {
      return res.render('otpConfirm', { title: 'OTP Confirmation', email, errorMessage: 'Invalid OTP.' });
    }
  
    otpStore.deleteOtp(email);
  
    try {
      // Insert new user into the database
      const { username,password,gender,CCCD,birth,email } = req.session.registrationData; // Use session to store user data temporarily
      console.log(req.session.registrationData)
      const newUser = new User({
        username:username,
        password:password,
        email:email,
        birth:birth,
        gender:gender,
        CCCD:CCCD
      });
      await newUser.save();
  
      res.render('login', { title: 'Login', successMessage: 'Registration successful! Please log in.',error:'none' });
    } catch (err) {
      console.error(err);
      res.render('otpConfirm', { title: 'OTP Confirmation', email, errorMessage: 'Failed to complete registration. Please try again.' });
    }
  };
  
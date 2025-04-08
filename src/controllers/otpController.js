const otpStore = require('../models/otpStore')
const { MongoClient } = require('mongodb');
require('dotenv').config
const bcrypt = require('bcryptjs');
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
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db('Restaurant');
      const customers = db.collection('customer');

      // Insert new user into the database
      const { name, phone, address, password } = req.session.registrationData; // Use session to store user data temporarily
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(req.session.registrationData)
      const newUser = {
        name,
        email,
        phone,
        address,
        password: hashedPassword,
      };
      await customers.insertOne(newUser);
  
      res.render('login', { title: 'Login', successMessage: 'Registration successful! Please log in.' });
    } catch (err) {
      console.error(err);
      res.render('otpConfirm', { title: 'OTP Confirmation', email, errorMessage: 'Failed to complete registration. Please try again.' });
    }
  };
  
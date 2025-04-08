const User = require('../models/user');
const jwt = require('../config/jwt');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const otpStore = require('../models/otpStore')
const nodemailer = require('nodemailer');
require('dotenv')
exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.getRegister = (req, res) => {
    res.render('register', { error: null });
};

exports.postRegister = async (req, res) => {
    const { username, password, email, birth, gender, CCCD } = req.body;

    try {
        // Check if the username already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.render('register', { error: 'Username already exists' });
        }

        // Create a new user with the hashed password
        const newUser = new User({
            username,
            password,
            email,
            birth,
            gender,
            CCCD
        });
        console.log(newUser)
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true
          });
        
        otpStore.storeOtp(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Store OTP for 5 minutes
          console.log(otpStore.getOtp(email))
         // Send OTP via email
        const transporter = nodemailer.createTransport({
           service: 'gmail',
           auth: {
             user: process.env.EMAIL_USER, // email
             pass: process.env.EMAIL_PASS, // email password
           },
        });
      
        await transporter.sendMail({
           from: process.env.EMAIL_USER,
           to: email,
           subject: 'Your OTP for Registration',
           text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        });
        // req.session.registrationData = {
        //   name: req.body.name,
        //   email: req.body.email,
        //   phone: req.body.phone,
        //   address: req.body.address,
        //   password: req.body.password
        //   };
         // Redirect to OTP confirmation page
        res.render('otpConfirm', { title: 'OTP Confirmation',errorMessage:'none', email });
    } catch (err) {
        console.error('Error during registration:', err); // Log the actual error
        res.render('register', { error: 'An error occurred while creating your account. Please try again later.' });
    }
};


exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.matchPasswords(password))) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Tạo token và lưu vào cookie
        const token = jwt.generateToken(user);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        res.render('login', { error: 'An unexpected error occurred. Please try again later.' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token'); // Xóa token trong cookie
    res.redirect('/');
};
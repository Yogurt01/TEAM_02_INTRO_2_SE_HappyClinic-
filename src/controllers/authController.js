const User = require('../models/user');
const jwt = require('../config/jwt');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const otpStore = require('../models/otpStore')
const nodemailer = require('nodemailer');
const generatePassword = require('generate-password');
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
        req.session.registrationData = {
          username: req.body.username,
          email: req.body.email,
          gender:req.body.gender,
          birth: req.body.birth,
          password: req.body.password,
          CCCD:req.body.CCCD
        };
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
        if (user.role === 'admin'){
          res.redirect('/admin')
        }
        else{
          if (user.isBanned === true){
            return res.render('login', { error: 'Your account is banned! Please contact admin for more information' });
          }
          res.redirect('/dashboard');
        }
        
    } catch (error) {
        res.render('login', { error: 'An unexpected error occurred. Please try again later.' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token'); // Xóa token trong cookie
    res.redirect('/');
};
exports.googleLogin = async (req, res) => {
  try {
    const { user } = req; 
    console.log('user',user)
    const token = jwt.generateToken(user);
    res.cookie('token', token, { httpOnly: true });
    // Check if email exists
    const email =
        user.email ||                         // already set on user
        user.emails?.[0]?.value ||            // from Google profile
        user._json?.email;
    console.log('email',email)
    let existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      // User not found, add to db
      const password = generatePassword.generate({
        length: 10,
        numbers: true
      });
      existingUser = new User({
        id: user.id,
        username: email,
        email: email,
        password: password
      });

      await existingUser.save();
    }
    if (existingUser.isBanned === true){
            return res.render('login', { error: 'Your account is banned! Please contact admin for more information' });
          }
    // Generate token for the user found or created
    res.render('dashboard', { user: existingUser });

  } catch (err) {
    console.error(err);
    res.redirect('/'); // or render an error page
  }
}
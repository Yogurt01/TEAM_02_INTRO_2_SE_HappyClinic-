const User = require('../models/user');
const jwt = require('../config/jwt');

exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.getRegister = (req, res) => {
    res.render('register', { error: null });
};

exports.postRegister = async (req, res) => {
    const { username, password, email, birth, gender, CCCD } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.render('register', { error: 'Username already exists' });
        }

        const newUser = new User({ username, password, email, birth, gender, CCCD });
        await newUser.save();
        res.redirect('/auth/login');
    } catch (err) {
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
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
const authController = require('./controllers/authController')
const cookieParser = require('cookie-parser');
const session = require("express-session");
const passport = require("passport");
const availabilityRoutes = require('./routes/availabilityRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const passportConfig = require('./config/passport');
const contactRoutes = require('./routes/contactRoutes');
passportConfig();
require('dotenv').config();


const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const profileRoutes = require('./routes/profileRoutes'); //profile
const paymentRoutes = require('./routes/paymentRoutes')

const app = express();

app.set('view engine', 'ejs')
app.set('views', './views');
app.use(express.json());  // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public')); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }  // 1 day in milliseconds
}));

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      // verifyToken trả về payload như { id, username }
      const payload = require('./config/jwt').verifyToken(token);
      res.locals.user = payload;  
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

connectDB()
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
app.use('/auth', authRoutes);
app.use('/availability', availabilityRoutes);
app.use('/medicalRecord', medicalRecordRoutes);
app.use('/profile', profileRoutes); //profile
app.use('/payment', paymentRoutes)
app.use('/admin', adminRoutes);
app.use('/', dashboardRoutes); 
app.use('/contact', contactRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
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
const https = require('https');
const chatSupportRoutes = require('./routes/chatSupportRoutes');
const contactRouter = require('./routes/contactRoutes');
const announcementRoutes = require('./routes/announcementRoutes');


passportConfig();
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const keyPath = path.resolve(__dirname, 'config', 'keys', 'localhost-key.pem');
const certPath = path.resolve(__dirname, 'config', 'keys', 'localhost.pem');

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const authRoutes = require('./routes/authRoutes')
// const dashboardRoutes = require('./routes/dashboardRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes'); //role based 
const profileRoutes = require('./routes/profileRoutes'); //profile
const paymentRoutes = require('./routes/paymentRoutes')
const doctorSearchRoutes = require('./routes/doctorSearch');
const faqsRoutes = require('./routes/faqsRoutes');
const helpRoutes = require('./routes/helpRoutes');
const docAppoint = require('./routes/doctorAppointmentRoutes')
const patientSearchRoutes = require('./routes/patientSearchRoutes');
const appointmentRoutes = require('./routes/appointment');
const medFormRoutes = require('./routes/medFormRoutes');
const helpRequestRoutes = require('./routes/helpRequestRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const homeRoutes = require('./routes/homeRoutes');

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
app.use('/chatSupport', chatSupportRoutes);
app.use('/contact', contactRouter);
app.use('/announcement', announcementRoutes);
app.use('/doctorSearch', doctorSearchRoutes);
app.use('/doctor', docAppoint)
app.use('/faqs', faqsRoutes);
app.use('/help', helpRoutes);
app.use('/patientSearch', patientSearchRoutes);
app.use('/appointment', appointmentRoutes)
app.use('/medical-form', medFormRoutes)
app.use('/dashboard', dashboardRoutes);
// app.use('/dashboard', dashboardRoutes); //role based
app.use('/help-requests', helpRequestRoutes);
app.use('/about', aboutRoutes);
// app.use('/', homeRoutes);


app.get('/api/medicines', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'medicines.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  res.json(JSON.parse(data));
});
const PORT = process.env.PORT;
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS server running at https://localhost:${PORT}`);
});
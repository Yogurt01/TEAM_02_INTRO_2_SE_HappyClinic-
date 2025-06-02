const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
const authController = require('./controllers/authController')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const cookieParser = require('cookie-parser');
const session = require("express-session");
const passport = require("passport");
require('dotenv')
require('./config/passport')(); // <-- This initializes and registers the Google strategy

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


connectDB()
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes); 
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
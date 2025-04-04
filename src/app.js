const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
const authController = require('./controllers/authController')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');
require('dotenv')

const app = express();

app.set('view engine', 'ejs')
app.set('views', './views');
app.use(express.json());  // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public')); 

connectDB()

app.use('/',authController.getRegister)
app.use('/auth', authRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
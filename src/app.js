const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
const authController = require('./controllers/authController')
require('dotenv')
const app = express();
connectDB()
app.use('/',authController.getRegister)
app.use('/auth', authRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
require('dotenv')
const app = express();
connectDB()
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
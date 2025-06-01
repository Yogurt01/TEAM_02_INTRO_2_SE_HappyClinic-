const mongoose = require('mongoose');
require("dotenv").config()

const URI = process.env.MONGO_URI
const connectDB = async () => {
  // try {
  //   // await mongoose.connect(URI, {
  //   //   useNewUrlParser: true,
  //   //   useUnifiedTopology: true,
  //   // });
  //   await mongoose.connect(URI).then(() => {
  //     console.log('MongoDB connected successfully'))
  //   .catch((err) => {
  //     console.error('Error connecting to MongoDB:', err);
  //     process.exit(1); // Exit process with failure
  //   }
  //   // console.log('MongoDB connected successfully');
  // } catch (err) {
  //   console.error('Error connecting to MongoDB:', err);
  //   process.exit(1); // Exit process with failure
  // }
  try {
  // Kết nối MongoDB sử dụng async/await
  await mongoose.connect(URI);
  console.log('MongoDB connected successfully');
} catch (err) {
  // Xử lý lỗi nếu kết nối không thành công
  console.error('Error connecting to MongoDB:', err);
  process.exit(1); // Thoát quá trình với lỗi
}
};

module.exports = connectDB;
// const jwt = require('../config/jwt');

// // Hàm xác thực token dịch token ra user -> gán user vào req.user
// const authenticateToken = (req, res, next) => {
//     const token = req.cookies.token; // Lấy token từ cookie 
//     if (!token) { 
//         return res.redirect('/auth/login');  // Nếu không có token -> chuyển hướng đến trang login
//     }

//     try {
//         const user = jwt.verifyToken(token); // Giải mã token
//         req.user = user; // Gán user vào req.user
//         next();
//     } catch (error) {
//         return res.redirect('/auth/login'); // Nếu token không hợp lệ -> chuyển hướng đến trang login
//     }
// };

// module.exports = authenticateToken;

// src/middlewares/authMiddleswares.js
require('dotenv').config();
const jwt = require('../config/jwt');

function authenticateToken(req, res, next) {
  // Lấy token từ cookie
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    // Giải mã token, trả về payload = { id, username }
    const payload = jwt.verifyToken(token);
    req.user = payload;  // Gán payload vào req.user để controller dùng
    return next();
  } catch (error) {
    return res.redirect('/auth/login');
  }
}

module.exports = authenticateToken;

const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctorController');
const authenticateToken = require('../middlewares/authMiddlesware');

// Route GET /doctorSearch (có thể thêm middleware nếu cần xác thực người dùng)
router.get('/', authenticateToken, doctorController.searchDoctors);

module.exports = router;

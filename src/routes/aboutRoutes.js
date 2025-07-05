const express = require('express');
const router  = express.Router();

const auth    = require('../middlewares/authMiddlesware');
const aboutCtrl = require('../controllers/aboutController');

// Cho mọi user đã login xem About
router.get('/', auth, aboutCtrl.about);

module.exports = router;

// src/routes/homeRoutes.js
const express           = require('express');
const router            = express.Router();
const authenticateToken = require('../middlewares/authMiddlesware');
const homeCtrl          = require('../controllers/homeController');

// GET / → chỉ cần login, sau đó homeCtrl.home sẽ redirect
router.get('/', authenticateToken, homeCtrl.home);

module.exports = router;

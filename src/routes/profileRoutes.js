const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profileController');
const authenticateToken = require('../middlewares/authMiddlesware');

// Route GET /profile
router.get('/', authenticateToken, profileController.getProfile);

// Route POST /profile/edit
router.post('/edit', authenticateToken, profileController.postEditProfile);

// Route POST /profile/delete
router.post('/delete', authenticateToken, profileController.postDeleteProfile);

module.exports = router;

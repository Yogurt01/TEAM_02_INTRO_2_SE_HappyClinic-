const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Protect these routes with admin-only middleware in real app
router.get('/users', adminController.getAllUsers);
router.post('/ban/:userId', adminController.banUser);
router.post('/unban/:userId', adminController.unbanUser);

module.exports = router;

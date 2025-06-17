// src/routes/chatRoutes.js
const express = require('express');
const router  = express.Router();
const authenticateToken = require('../middlewares/authMiddlesware');
const chatController    = require('../controllers/chatController');

// Giao diện chat
router.get('/', authenticateToken, chatController.getChat);

// API proxy chat
router.post('/api', authenticateToken, chatController.postChat);

module.exports = router;

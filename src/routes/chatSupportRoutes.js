const express = require('express');
const router = express.Router();
const chatSupportController = require('../controllers/chatSupportController');

router.get('/messages/:sessionId', chatSupportController.getMessagesBySession);
router.post('/send', chatSupportController.sendMessage);
router.delete('/clear/:sessionId', chatSupportController.clearMessagesBySession);
router.get('/sessions', chatSupportController.getSessions);

module.exports = router;

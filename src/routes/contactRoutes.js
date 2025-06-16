const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/messages/:sessionId', contactController.getMessagesBySession);
router.post('/send', contactController.sendMessage);
router.delete('/clear/:sessionId', contactController.clearMessagesBySession);
router.get('/sessions', contactController.getSessions);

module.exports = router;

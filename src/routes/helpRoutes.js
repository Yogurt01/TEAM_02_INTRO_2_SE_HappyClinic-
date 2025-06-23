const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');

router.get('/', helpController.getHelpForm);
router.post('/', helpController.submitHelpForm);

module.exports = router;

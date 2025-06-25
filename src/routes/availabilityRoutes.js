const express = require('express');
const authenticateToken = require('../middlewares/authMiddlesware');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');


router.get('/', authenticateToken, availabilityController.getAvailability);

//router.post('/', authenticateToken, availabilityController.postAvailability);



module.exports = router;

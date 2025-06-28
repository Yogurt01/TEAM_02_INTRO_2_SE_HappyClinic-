const express          = require('express');
const router           = express.Router();

const adminHelpController = require('../controllers/adminHelpController');
const authenticateToken = require('../middlewares/authMiddlesware')


router.get('/', authenticateToken, adminHelpController.listRequests);
router.post('/:id/answer', authenticateToken, adminHelpController.submitAnswer);
router.get('/:id/edit',authenticateToken, adminHelpController.showEditForm);
module.exports = router;
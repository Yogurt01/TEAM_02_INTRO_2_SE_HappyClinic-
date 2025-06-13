const express = require('express');
const router = express.Router();
const adminHelpController = require('../controllers/adminHelpController');

router.get('/admin/help-requests', adminHelpController.listRequests);
router.post('/admin/help-requests/:id/answer', adminHelpController.submitAnswer);
router.get('/admin/help-requests/:id/edit', adminHelpController.showEditForm);


module.exports = router;

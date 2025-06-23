const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const stats = require('../controllers/statsController')
const authenticateToken = require('../middlewares/authMiddlesware')
const adminHelpController = require('../controllers/adminHelpController');
// Protect these routes with admin-only middleware in real app
router.get('/', authenticateToken, (req, res) => {
    res.render('adminManager', { user: req.user });
});
//Users Management Routes
router.get('/users', adminController.postUserManager);
router.post('/ban/:userId', adminController.banUser);
router.post('/unban/:userId', adminController.unbanUser);

//Payment Management Routes
router.get('/payments', adminController.postPaymentManagement);
router.post('/payment/confirm/:paymentId', adminController.confirmPayment);
router.post('/payment/cancel/:paymentId', adminController.cancelPayment);
//Appointment Management Routes
router.get('/appointment', adminController.getAllAppointments);
router.get('/appointment/:id', adminController.getAppointmentDetail);
router.post('/appointment/:id/update', adminController.updateAppointment);
router.post('/appointment/:id/delete', adminController.deleteAppointment);
//Anilyzer Routes
router.get('/anylyzer', stats.anylyzeStats);
//Help Requests Management Routes
router.get('/help-requests', adminHelpController.listRequests);
router.post('/help-requests/:id/answer', adminHelpController.submitAnswer);
router.get('/help-requests/:id/edit', adminHelpController.showEditForm);
module.exports = router;

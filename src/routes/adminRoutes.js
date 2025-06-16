const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const stats = require('../controllers/statsController')
const authenticateToken = require('../middlewares/authMiddlesware')
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

//Anilyzer Routes
router.get('/anylyzer', stats.anylyzeStats);
module.exports = router;

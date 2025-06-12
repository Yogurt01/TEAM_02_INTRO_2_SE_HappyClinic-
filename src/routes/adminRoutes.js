const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddlesware')
// Protect these routes with admin-only middleware in real app
router.get('/', authenticateToken, (req, res) => {
    res.render('adminManager', { user: req.user });
});
router.get('/manage-users', adminController.postUserManager);
router.post('/ban/:userId', adminController.banUser);
router.post('/unban/:userId', adminController.unbanUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/announcementController');
const authenticateToken = require('../middlewares/authMiddlesware')

// Route hiển thị (có kiểm tra token)
router.get('/', authenticateToken, controller.getAllAnnouncements);

// CRUD nếu là admin/staff (cũng cần kiểm tra token)
router.get('/add', authenticateToken, controller.showAddForm);
router.post('/add', authenticateToken, controller.createAnnouncement);
router.get('/edit/:id', authenticateToken, controller.showEditForm);
router.post('/edit/:id', authenticateToken, controller.updateAnnouncement);
router.post('/delete/:id', authenticateToken, controller.deleteAnnouncement);

module.exports = router;

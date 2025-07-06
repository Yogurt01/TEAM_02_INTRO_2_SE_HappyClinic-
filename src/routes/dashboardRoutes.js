// const express = require('express');
// const router = express.Router();
// const authenticateToken = require('../middlewares/authMiddlesware');


// router.get('/dashboard', authenticateToken, (req, res) => {
//     res.render('dashboard', { user: req.user });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authMiddlesware');
const role          = require('../middlewares/roleChecker');
const dashCtrl      = require('../controllers/dashboardController');

// // /dashboard/admin  – chỉ admin
// router.get('/admin',  authenticate, role('admin'),  dashCtrl.admin);

// // /dashboard/doctor – chỉ doctor
// router.get('/doctor', authenticate, role('doctor'), dashCtrl.doctor);

// // /dashboard/patient – chỉ patient
// router.get('/patient', authenticate, role('patient'), dashCtrl.patient);

// // /dashboard – tất cả user đều có thể truy cập
router.get('/dashboard', authenticate, (req, res) => {
    console.log(req.user);
    res.render('dashboard', { user: req.user });
});

module.exports = router;

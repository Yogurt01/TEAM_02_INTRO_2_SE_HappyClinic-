// routes/contact.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('contact'); // render file views/contact.ejs
});

// Giao diện hỗ trợ trực tuyến cho admin/staff
router.get('/adminContact', (req, res) => {
  res.render('adminContact'); // views/adminContact.ejs
});

module.exports = router;

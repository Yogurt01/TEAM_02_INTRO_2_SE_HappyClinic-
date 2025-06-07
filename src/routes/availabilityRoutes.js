const express = require('express');
const authenticateToken = require('../middlewares/authMiddlesware');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');


router.get('/availability', authenticateToken, availabilityController.getAvailability);

router.post('/availability', authenticateToken, availabilityController.postAvailability);

router.post('/availability/check/:appointmentCode', authenticateToken, async (req, res) => {
  try {
    await availabilityController.markChecked(req.params.appointmentCode);
    res.redirect('/auth/availability');
  } catch (err) {
    res.status(500).send("Error marking slot as checked");
  }
});

router.post('/availability/delete/:appointmentCode', authenticateToken, async (req, res) => {
  try {
    await availabilityController.deleteAvailability(req.params.appointmentCode);
    res.redirect('/auth/availability');
  } catch (err) {
    res.status(500).send("Error deleting slot");
  }
});

router.post('/availability/edit/:appointmentCode', authenticateToken, async (req, res) => {
  try {
    await availabilityController.editAvailability(req.params.appointmentCode, req.body);
    res.redirect('/auth/availability?success=1&filterStatus=all');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing slot");
  }
});

module.exports = router;

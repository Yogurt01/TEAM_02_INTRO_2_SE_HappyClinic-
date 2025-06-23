const express = require('express');
const authenticateToken = require('../middlewares/authMiddlesware');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');


router.get('/', authenticateToken, availabilityController.getAvailability);

router.post('/', authenticateToken, availabilityController.postAvailability);

router.post('/check/:appointmentCode', authenticateToken, async (req, res) => {
  try {
    await availabilityController.markChecked(req.params.appointmentCode);
    res.redirect('/availability');
  } catch (err) {
    res.status(500).send("Error marking slot as checked");
  }
});

router.post('/availability/delete/:appointmentCode', authenticateToken, async (req, res) => {
  try {
    await availabilityController.deleteAvailability(req.params.appointmentCode);
    res.redirect('/availability');
  } catch (err) {
    res.status(500).send("Error deleting slot");
  }
});

router.post('/availability/edit/:appointmentCode', authenticateToken, async (req, res) => {
  try {
    await availabilityController.editAvailability(req.params.appointmentCode, req.body);
    res.redirect('/availability?success=1&filterStatus=all');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing slot");
  }
});

module.exports = router;

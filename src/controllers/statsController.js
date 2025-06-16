const User = require('../models/user');
const Appointment = require('../models/appointment');
const Payment = require('../models/payment');

exports.anylyzeStats = async (req, res) => {
  try {
    const type = req.query.type || 'day';
    const now = new Date();

    let start, end;

    switch (type) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'day':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
    }

    const [newUsers, newAppointments, payments] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Appointment.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Payment.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    ]);

    res.render('stats', {
      type,
      stats: {
        newUsers,
        newAppointments,
        payments
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};


const User = require('../models/user');
const Appointment = require('../models/appointment');
const Payment = require('../models/payment');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const width = 200, height = 200;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function createBarChart(title, current, previous, label, options = {}) {
  const { yFormat = 'int', prefix = '' } = options;

  const data = {
    labels: ['Previous', 'Current'],
    datasets: [{
      label,
      data: [previous, current],
      backgroundColor: ['#94a3b8', '#3b82f6']
    }]
  };

  const config = {
    type: 'bar',
    data,
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18 }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (yFormat === 'int') return parseInt(value);
              if (yFormat === 'million') return prefix + (value / 1_000_000).toFixed(1) + 'M';
              return value;
            }
          }
        }
      }
    }
  };

  const image = await chartJSNodeCanvas.renderToDataURL(config);
  return image;
}


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
    let prevStart, prevEnd;

    switch (type) {
    case 'month':
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    case 'year':
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        prevEnd = new Date(now.getFullYear(), 0, 1);
        break;
    case 'day':
    default:
        prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const [prevUsers, prevAppointments, prevPaymentStats] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: prevStart, $lt: prevEnd } }),
    Appointment.countDocuments({ createdAt: { $gte: prevStart, $lt: prevEnd } }),
    Payment.aggregate([
        { $match: { createdAt: { $gte: prevStart, $lt: prevEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    ]);

    const [newUsers, newAppointments, newPaymentStats] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    Appointment.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    Payment.aggregate([
        { $match: { createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    ]);

    // Extract totals safely
    const prevPayments = prevPaymentStats[0]?.total || 0;
    const payments = newPaymentStats[0]?.total || 0;

    const userChart = await createBarChart("Users", newUsers, prevUsers, "New Users", { yFormat: 'int' });
    const appointmentChart = await createBarChart("Appointments", newAppointments, prevAppointments, "Appointments", { yFormat: 'int' });
    const paymentChart = await createBarChart(
    "Payments",
    payments,
    prevPayments,
    "Revenue",
    { yFormat: 'million', prefix: '$' } // or '₫'
    );
    
    res.render('stats', {
        type,
        stats: {
            newUsers,
            newAppointments,
            payments
        },
        charts: {
            userChart,
            appointmentChart,
            paymentChart
        }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};


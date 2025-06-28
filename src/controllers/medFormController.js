const Appointment = require('../models/appointment');
const MedicalForm = require('../models/medForm');
const Payment = require('../models/payment')
const priceMap = require('../controllers/medicinesPrices');

const calculateTotalPrice = (medicines) => {
  let total = 0;
  for (const med of medicines) {
    const pricePerUnit = priceMap[med.name.toLowerCase()] || 0;
    total += pricePerUnit * med.quantity;
  }
  return total;
};
async function createPaymentByEmail(email, paymentMethod = 'BankTransfer') {
  const medForm = await MedicalForm.findOne({ patientEmail: email }).sort({ date: -1 });
  if (!medForm) {
    throw new Error('Không tìm thấy phiếu khám bệnh với email này.');
  }
  console.log(medForm.medicines)
  const totalPrice = calculateTotalPrice(medForm.medicines) + 20000;
  const payment = new Payment({
    username: medForm.patientName,
    email: medForm.patientEmail,
    amount: totalPrice,
    paymentMethod,
    status: 'Unpaid',
    appointmentId: medForm._id,
    date: new Date
  });

  await payment.save();
  return payment;
}

// GET: Render form create từ appointment
exports.renderCreateForm = async (req, res) => {
  const appointmentId = req.query.appointmentId;
  if (!appointmentId) return res.status(400).send('Missing appointmentId');

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).send('Appointment not found');

    res.render('medForm', { appointment });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST: Lưu phiếu khám bệnh
exports.createMedicalForm = async (req, res) => {
  try {
    const { patientName, patientEmail, examinationDate, symptoms, predictedDisease } = req.body;

    const rawMedicines = req.body.medicines || [];

    // Convert object to array if needed
    const medicineArray = Array.isArray(rawMedicines)
      ? rawMedicines
      : Object.values(rawMedicines);

    const parsedMedicines = medicineArray
      .map(med => {
        const quantity = parseInt(med.quantity);
        if (!med.name || !med.unit || isNaN(quantity) || !med.usage) return null;
        return {
          name: med.name,
          unit: med.unit,
          quantity,
          usage: med.usage,
        };
      })
      .filter(med => med !== null);

    const newForm = new MedicalForm({
      patientName,
      patientEmail,
      examinationDate,
      symptoms,
      predictedDisease,
      medicines: parsedMedicines
    });

    await newForm.save();
    createPaymentByEmail(patientEmail);
    res.redirect('/doctor/today');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tạo phiếu khám bệnh');
  }
};

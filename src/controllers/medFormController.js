const Appointment = require('../models/appointment');
const MedicalForm = require('../models/medForm');
const Payment = require('../controllers/paymentController')

async function createPaymentByEmail(email, paymentMethod = 'Internet Banking') {
  const medForm = await MedForm.findOne({ email }).sort({ date: -1 });
  if (!medForm) {
    throw new Error('Không tìm thấy phiếu khám bệnh với email này.');
  }

  const payment = new Payment({
    username: medForm.username,
    email: medForm.email,
    amount: medForm.price,
    paymentMethod,
    status: 'Unpaid',
    appointmentId: medForm._id
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

    res.render('medicalForms/create', { appointment });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// POST: Lưu phiếu khám bệnh
exports.createMedicalForm = async (req, res) => {
  try {
    const { patientName, examinationDate, symptoms, predictedDisease, medicines } = req.body;

    const parsedMedicines = Array.isArray(medicines.name)
      ? medicines.name.map((_, i) => ({
          name: medicines.name[i],
          unit: medicines.unit[i],
          quantity: parseInt(medicines.quantity[i]),
          usage: medicines.usage[i]
        }))
      : [{ ...medicines, quantity: parseInt(medicines.quantity) }];

    const newForm = new MedicalForm({
      patientName,
      examinationDate,
      symptoms,
      predictedDisease,
      medicines: parsedMedicines
    });

    await newForm.save();
    createPaymentByEmail(patientName)
    res.redirect('/doctor/today');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tạo phiếu khám bệnh');
  }
};

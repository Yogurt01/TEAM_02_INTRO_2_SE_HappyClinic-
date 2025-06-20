const Payment = require('../models/payment');

// Lấy danh sách payment theo email
exports.listPaymentsOfUser = async (req, res) => {
  try {
    const email = req.user.email;  // Lấy email từ session hoặc token
    const payments = await Payment.find({ email:email });
    res.render('payment', { payments, email });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lấy danh sách thanh toán');
  }
};

// Hiển thị trang thanh toán và tạo mã QR
exports.generateQR = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    // Tìm payment theo id
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).send('Không tìm thấy hóa đơn');

    // Tạo url QR (theo mẫu bạn đưa)
    const memo = `Thanh toán hóa đơn ${paymentId}`;
    const qrUrl = `https://img.vietqr.io/image/${process.env.BANK_CODE}-${process.env.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(process.env.ACCOUNT_NAME)}`;

    res.render('payment-qr', { payment, qrUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi tạo QR');
  }
};

// Xác nhận đã chuyển khoản → cập nhật trạng thái "Pending"
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).send('Không tìm thấy hóa đơn');

    payment.status = 'Pending';  // hoặc 'Paid' tùy logic bạn
    await payment.save();

    res.redirect('/payment');  // quay lại danh sách
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi xác nhận thanh toán');
  }
};


require('dotenv')
exports.showForm = (req, res) => {
  res.render('payment', { qrUrl: null });
};

exports.generateQR = (req, res) => {
  const { amount, memo } = req.body;
  
  const qrUrl = `https://img.vietqr.io/image/${process.env.BANK_CODE}-${process.env.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(process.env.ACCOUNT_NAME)}`;

  res.render('payment', { qrUrl });
};

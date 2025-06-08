const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');

// Route để hiển thị danh sách hóa đơn và lịch sử thanh toán
router.get('/', InvoiceController.getBillingHistory);

// Route để tạo hóa đơn mới cho lịch khám
router.post('/', InvoiceController.createInvoice);

// Route để thanh toán hóa đơn
router.post('/pay/:invoiceId', InvoiceController.payInvoice);

module.exports = router;

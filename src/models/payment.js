const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointments' },
    date: { type: Date, required: true },
    username: { type: String, required: true},
    email: { type: String, required: true},
    amount: {type: Number , required:true},
    paymentMethod: { 
        type: String, 
        enum: ['Cash', 'Card', 'BankTransfer'], 
        required: true,
        default: 'BankTransfer' 
        },
    status: { 
        type: String, 
        enum: ['Unpaid', 'Paid', 'Pending', 'Failed'], 
        default: 'Unpaid',
        required: true
        }
});

module.exports = mongoose.model('payment', paymentSchema);
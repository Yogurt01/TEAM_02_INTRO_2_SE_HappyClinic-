const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  sender: String,
  content: String,
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);

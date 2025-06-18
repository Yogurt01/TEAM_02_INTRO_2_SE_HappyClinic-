const mongoose = require('mongoose');

const chatSupportSchema = new mongoose.Schema({
  sender: String,
  content: String,
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatSupport', chatSupportSchema);

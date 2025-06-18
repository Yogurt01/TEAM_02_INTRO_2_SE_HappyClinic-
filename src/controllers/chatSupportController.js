const ChatSupport = require('../models/chatSupport');

// Lấy tất cả tin nhắn của một sessionId (dành cho staff)
exports.getMessagesBySession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const messages = await ChatSupport.find({ sessionId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy tin nhắn' });
  }
};

// Gửi tin nhắn (user hoặc staff)
exports.sendMessage = async (req, res) => {
  const { sender, content, sessionId } = req.body;

  if (!content || !sender || !sessionId) {
    return res.status(400).json({ error: 'Thiếu nội dung, người gửi hoặc sessionId' });
  }

  try {
    const newMessage = {
      sender,
      content,
      sessionId,
      timestamp: new Date()
    };

    const msg = new ChatSupport(newMessage);
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    console.error('Lỗi khi gửi tin nhắn:', err);
    res.status(500).json({ error: 'Không thể gửi tin nhắn' });
  }
};


// Xóa tất cả tin nhắn của một sessionId (khi user rời trang)
exports.clearMessagesBySession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    await ChatSupport.deleteMany({ sessionId });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa tin nhắn' });
  }
};

exports.getSessions = async (req, res) => {
  const sessions = await ChatSupport.aggregate([
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: '$sessionId',
        lastTimestamp: { $first: '$timestamp' },
        lastSender: { $first: '$sender' }
      }
    },
    {
      $sort: { lastTimestamp: -1 }
    }
  ]);

  // Gán tên giả kiểu "Người dùng 1", "Người dùng 2", ...
  const namedSessions = sessions.map((s, i) => ({
    _id: s._id,
    name: `Người dùng ${i + 1}`,
    createdAt: s.lastTimestamp,
    lastMessageTimestamp: s.lastTimestamp
  }));

  res.json(namedSessions);
};

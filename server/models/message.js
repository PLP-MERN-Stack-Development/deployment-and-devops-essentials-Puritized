// models/message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
  isPrivate: { type: Boolean, default: false },
  to: { type: String, default: null } // optional receiver socket id for private messages
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
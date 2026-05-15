const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  trade_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
  sender_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender_role: { type: String, enum: ['user', 'admin'], required: true },
  message:     { type: String },
  image_url:   { type: String },
  created_at:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

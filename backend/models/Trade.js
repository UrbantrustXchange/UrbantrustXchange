// backend/models/Trade.js

const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['giftcard', 'btc'], required: true },
  amount:    { type: Number, required: true },   // USD for gift cards, BTC for crypto
  rate:      { type: Number, required: true },   // GHS per unit
  status:    {
    type:    String,
    enum:    ['pending', 'reviewing', 'paid', 'rejected'],
    default: 'pending',
  },
  // Gift card specific
  card_type:  { type: String },
  // BTC specific
  txid:       { type: String },
  // Uploaded proof (image path)
  image_url:  { type: String },
  // Admin note shown on status update emails
  adminNote:  { type: String },
  // Dispute
  dispute: {
    opened:    { type: Boolean, default: false },
    reason:    { type: String },
    openedAt:  { type: Date },
  },

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trade', tradeSchema);

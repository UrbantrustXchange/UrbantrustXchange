const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  name:       { type: String, required: true, unique: true },
  rate:       { type: Number, required: true },             // GHS per $1
  enabled:    { type: Boolean, default: true },
  risk_level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
});

module.exports = mongoose.model('GiftCard', giftCardSchema);

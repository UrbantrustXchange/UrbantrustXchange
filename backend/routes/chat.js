const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const Trade = require('../models/Trade');
const { protect, adminOrModerator } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/chat/:tradeId — get all messages for a trade
router.get('/:tradeId', protect, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    // Only owner or admin can read
    const isOwner = trade.user_id.toString() === req.user._id.toString();
    if (!isOwner && !['admin', 'moderator'].includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });

    const messages = await ChatMessage.find({ trade_id: req.params.tradeId })
      .sort({ created_at: 1 })
      .populate('sender_id', 'email role');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat/:tradeId — send a message (with optional image)
router.post('/:tradeId', protect, upload.single('image'), async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const isOwner = trade.user_id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const msg = await ChatMessage.create({
      trade_id:    req.params.tradeId,
      sender_id:   req.user._id,
      sender_role: req.user.role,
      message:     req.body.message || null,
      image_url
    });

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// backend/routes/trades.js

const express = require('express');
const Trade   = require('../models/Trade');
const User    = require('../models/User');
const { protect }  = require('../middleware/auth');
const upload  = require('../middleware/upload');
const {
  sendTradeOpenedEmail,
  sendDisputeOpenedEmail,
} = require('../utils/mailer');

const router = express.Router();

// ── POST /api/trades — create a new trade ─────────────────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { type, amount, rate, card_type, txid } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const trade = await Trade.create({
      user_id:   req.user._id,
      type,
      amount:    parseFloat(amount),
      rate:      parseFloat(rate),
      card_type: card_type || undefined,
      txid:      txid      || undefined,
      image_url,
    });

    // Send trade opened notification email
    try {
      await sendTradeOpenedEmail(req.user.email, {
        tradeId:  trade._id,
        type:     trade.type,
        amount:   trade.amount,
        rate:     trade.rate,
        cardType: trade.card_type || null,
        payout:   trade.amount * trade.rate,
      });
      console.log(`✅ [trades] Trade opened email sent to ${req.user.email}`);
    } catch (emailErr) {
      console.error('❌ [trades] Failed to send trade opened email:', emailErr.message);
    }

    res.status(201).json(trade);

  } catch (err) {
    console.error('[POST /trades]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/trades — all trades for logged-in user ───────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [trades, total] = await Promise.all([
      Trade.find({ user_id: req.user._id })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Trade.countDocuments({ user_id: req.user._id }),
    ]);

    res.json({
      trades,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });

  } catch (err) {
    console.error('[GET /trades]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/trades/:id — single trade detail ─────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user_id: req.user._id };

    const trade = await Trade.findOne(query);

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found.' });
    }

    res.json(trade);

  } catch (err) {
    console.error('[GET /trades/:id]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/trades/:id/dispute — user opens a dispute ───────────────────────
router.post('/:id/dispute', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Dispute reason is required.' });
    }

    if (reason.trim().length < 20) {
      return res.status(400).json({
        message: 'Please provide more detail (at least 20 characters).',
      });
    }

    const trade = await Trade.findOne(
  req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user_id: req.user._id }
);

if (!trade) {
  return res.status(404).json({ message: 'Trade not found.' });
}

    if (trade.dispute && trade.dispute.opened) {
      return res.status(400).json({
        message: 'A dispute has already been opened for this trade.',
      });
    }

    trade.dispute = {
      opened:   true,
      reason:   reason.trim(),
      openedAt: new Date(),
    };
    await trade.save();

    // Send dispute confirmation email
    try {
      await sendDisputeOpenedEmail(req.user.email, {
        tradeId:       trade._id,
        disputeReason: reason.trim(),
      });
      console.log(`✅ [trades] Dispute email sent to ${req.user.email}`);
    } catch (emailErr) {
      console.error('❌ [trades] Failed to send dispute email:', emailErr.message);
    }

    res.status(201).json({
      message: 'Dispute submitted successfully.',
      dispute: trade.dispute,
    });

  } catch (err) {
    console.error('[POST /trades/:id/dispute]', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
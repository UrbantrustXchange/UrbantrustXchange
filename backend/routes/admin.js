// backend/routes/admin.js

const express = require('express');
const Trade   = require('../models/Trade');
const User    = require('../models/User');
const { protect, adminOnly, adminOrModerator } = require('../middleware/auth');
const {
  sendTradeStatusEmail,
} = require('../utils/mailer');

const router = express.Router();

// ── GET /api/admin/trades — all trades ────────────────────────────────────────
router.get('/trades', protect, adminOrModerator, async (_req, res) => {
  try {
    const trades = await Trade.find()
      .sort({ created_at: -1 })
      .populate('user_id', 'email phoneNumber isVerified');
    res.json(trades);
  } catch (err) {
    console.error('[GET /admin/trades]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/trades/:id — single trade detail (for admin chat) ──────────
router.get('/trades/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('user_id', 'email phoneNumber');
    if (!trade) return res.status(404).json({ message: 'Trade not found.' });
    res.json(trade);
  } catch (err) {
    console.error('[GET /admin/trades/:id]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/trades/:id/status ────────────────────────────────────────
router.patch('/trades/:id/status', protect, adminOnly, async (req, res) => {
  const { status, adminNote } = req.body;

  const allowed = ['pending', 'reviewing', 'paid', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const trade = await Trade.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(adminNote !== undefined && { adminNote }),
      },
      { new: true }
    ).populate('user_id', 'email phoneNumber');

    if (!trade) return res.status(404).json({ message: 'Trade not found.' });

    // Increment totalTradedUSD when trade is marked paid
    if (status === 'paid') {
      await User.findByIdAndUpdate(
        trade.user_id._id,
        { $inc: { totalTradedUSD: trade.amount } }
      );
      console.log(`[admin] totalTradedUSD incremented for user: ${trade.user_id.email}`);
    }

    // Send status update email to trade owner
    const ownerEmail = trade.user_id?.email;
    if (ownerEmail) {
      try {
        await sendTradeStatusEmail(ownerEmail, {
          tradeId:  trade._id,
          type:     trade.type,
          amount:   trade.amount,
          rate:     trade.rate,
          cardType: trade.card_type || null,
          payout:   trade.amount * trade.rate,
          status:   trade.status,
          note:     trade.adminNote || null,
        });
        console.log(`✅ [admin] Status email sent to ${ownerEmail}`);
      } catch (emailErr) {
        console.error('❌ [admin] Failed to send status email:', emailErr.message);
      }
    }

    res.json(trade);
  } catch (err) {
    console.error('[PATCH /admin/trades/:id/status]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/users — list all users ────────────────────────────────────
router.get('/users', protect, adminOnly, async (_req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('[GET /admin/users]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/users/:id/verify — manually verify a user ───────────────
router.patch('/users/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified !== false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('[PATCH /admin/users/:id/verify]', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/role', protect, adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', protect, adminOnly, async (_req, res) => {
  try {
    const [
      totalTrades,
      pendingTrades,
      reviewingTrades,
      paidTrades,
      rejectedTrades,
      totalUsers,
      verifiedUsers,
    ] = await Promise.all([
      Trade.countDocuments(),
      Trade.countDocuments({ status: 'pending' }),
      Trade.countDocuments({ status: 'reviewing' }),
      Trade.countDocuments({ status: 'paid' }),
      Trade.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
    ]);

    const paidResult = await Trade.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$amount', '$rate'] } } } },
    ]);
    const totalPaidGHS = paidResult[0]?.total || 0;

    // Disputes opened count
    const openDisputes = await Trade.countDocuments({ 'dispute.opened': true });

    res.json({
      totalTrades,
      pendingTrades,
      reviewingTrades,
      paidTrades,
      rejectedTrades,
      totalUsers,
      verifiedUsers,
      openDisputes,
      totalPaidGHS: parseFloat(totalPaidGHS.toFixed(2)),
    });
  } catch (err) {
    console.error('[GET /admin/stats]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/btc-rate — current BTC rate from env ──────────────────────
router.get('/btc-rate', protect, adminOnly, async (_req, res) => {
  res.json({ rate: parseInt(process.env.BTC_RATE_GHS || '446250', 10) });
});

// ── PATCH /api/admin/btc-rate — update BTC rate in memory (runtime only) ──────
// Note: to persist across restarts, update the .env file or use a DB record.
let runtimeBtcRate = null;
router.patch('/btc-rate', protect, adminOnly, async (req, res) => {
  const { rate } = req.body;
  if (!rate || isNaN(rate) || rate <= 0) {
    return res.status(400).json({ message: 'Valid rate required.' });
  }
  runtimeBtcRate = parseInt(rate, 10);
  process.env.BTC_RATE_GHS = String(runtimeBtcRate);
  console.log(`[admin] BTC rate updated to GHS ${runtimeBtcRate}`);
  res.json({ rate: runtimeBtcRate, message: 'BTC rate updated.' });
});

module.exports = router;

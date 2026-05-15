const express = require('express');
const GiftCard = require('../models/GiftCard');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/cards — public: only enabled cards
router.get('/', async (_req, res) => {
  try {
    const cards = await GiftCard.find({ enabled: true });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cards/all — admin: all cards including disabled
router.get('/all', protect, adminOnly, async (_req, res) => {
  try {
    const cards = await GiftCard.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/cards/:id — admin: update rate, enabled, risk_level
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { rate, enabled, risk_level } = req.body;
    const card = await GiftCard.findByIdAndUpdate(
      req.params.id,
      { rate, enabled, risk_level },
      { new: true, runValidators: true }
    );
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

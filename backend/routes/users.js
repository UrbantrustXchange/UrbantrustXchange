// backend/routes/users.js

const express = require('express');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  sendPasswordChangedEmail,
  sendAccountDeletedEmail,
} = require('../utils/mailer');

const router = express.Router();

// All routes below require authentication
router.use(protect);

// ── PUT /api/users/profile ─────────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !phoneNumber.trim()) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  if (!/^\+?[0-9\s\-().]{7,20}$/.test(phoneNumber.trim())) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }

  try {
    const existing = await User.findOne({
      phoneNumber: phoneNumber.trim(),
      _id: { $ne: req.user._id },
    });

    if (existing) {
      return res.status(409).json({
        message: 'This phone number is already in use.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { phoneNumber: phoneNumber.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id:              user._id,
        email:           user.email,
        phoneNumber:     user.phoneNumber,
        role:            user.role,
        isVerified:      user.isVerified,
        isEmailVerified: user.isEmailVerified,
        totalTradedUSD:  user.totalTradedUSD,
        createdAt:       user.createdAt,
      },
    });

  } catch (err) {
    console.error('[PUT /users/profile]', err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        message: 'This phone number is already in use.',
      });
    }

    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── PUT /api/users/change-password ─────────────────────────────────────────────
router.put('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Both current and new password are required.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: 'New password must be at least 6 characters.',
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: 'New password must differ from current password.',
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    console.log(`[change-password] Password updated for: ${user._id}`);

    // Send password changed confirmation email
    // Wrapped in try/catch so a failed email does not
    // affect the password change success response
    try {
      await sendPasswordChangedEmail(user.email);
      console.log(`✅ [change-password] Confirmation email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ [change-password] Failed to send confirmation email:', emailErr.message);
    }

    res.json({ message: 'Password changed successfully.' });

  } catch (err) {
    console.error('[PUT /users/change-password]', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── DELETE /api/users/account ──────────────────────────────────────────────────
router.delete('/account', async (req, res) => {
  try {
    // Fetch user BEFORE deleting so we have the email
    // to send the confirmation after deletion
    const userToDelete = await User.findById(req.user._id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Store email before document is gone
    const deletedEmail = userToDelete.email;

    await User.findByIdAndDelete(req.user._id);

    console.log(`[DELETE /users/account] Deleted user: ${req.user._id}`);

    // Send account deletion confirmation email
    // Wrapped in try/catch so a failed email does not
    // affect the deletion success response
    try {
      await sendAccountDeletedEmail(deletedEmail);
      console.log(`✅ [delete-account] Confirmation email sent to ${deletedEmail}`);
    } catch (emailErr) {
      console.error('❌ [delete-account] Failed to send confirmation email:', emailErr.message);
    }

    res.json({ message: 'Account deleted successfully.' });

  } catch (err) {
    console.error('[DELETE /users/account]', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;

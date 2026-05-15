// backend/routes/auth.js

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');

const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require('../utils/mailer');

const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const buildVerificationUrl = (rawToken) => {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${base}/verify-email?token=${rawToken}`;
};

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

const validateRegistrationInput = ({ email, password, phoneNumber }) => {
  const errors = [];

  if (!email || !email.trim())
    errors.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push('A valid email address is required.');

  if (!phoneNumber || !phoneNumber.trim())
    errors.push('Phone number is required.');
  else if (!/^\+?[0-9\s\-().]{7,20}$/.test(phoneNumber.trim()))
    errors.push('A valid phone number is required.');

  if (!password)
    errors.push('Password is required.');
  else if (password.length < 6)
    errors.push('Password must be at least 6 characters.');

  return errors;
};

// ── POST /api/auth/register ────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, phoneNumber } = req.body;

  const validationErrors = validateRegistrationInput({ email, password, phoneNumber });
  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors[0],
      errors:  validationErrors,
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const phoneExists = await User.findOne({ phoneNumber: phoneNumber.trim() });
    if (phoneExists) {
      return res.status(409).json({
        message: 'An account with this phone number already exists.',
      });
    }

    const hashedPassword          = await bcrypt.hash(password, 12);
    const rawToken                = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = hashToken(rawToken);
    const verificationUrl         = buildVerificationUrl(rawToken);

    try {
      await sendVerificationEmail(normalizedEmail, verificationUrl);
      console.log(`✅ [register] Verification email sent to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error('❌ [register] Failed to send verification email:', emailErr.message);
      return res.status(500).json({
        message: 'Failed to send verification email. Please try again.',
      });
    }

    const user = await User.create({
      email:                       normalizedEmail,
      password:                    hashedPassword,
      phoneNumber:                 phoneNumber.trim(),
      emailVerificationToken:      hashedVerificationToken,
      emailVerificationExpires:    Date.now() + 1000 * 60 * 15,
      lastVerificationEmailSentAt: new Date(),
      isEmailVerified:             false,
    });

    console.log(`[register] User created: ${user.email}`);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: { email: user.email },
      _dev_verificationUrl: process.env.NODE_ENV !== 'production'
        ? verificationUrl
        : undefined,
    });

  } catch (err) {
    console.error('[register]', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        message: `An account with this ${field} already exists.`,
      });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── POST /api/auth/verify-email ────────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  try {
    const hashedToken = hashToken(token);

    const user = await User
      .findOne({
        emailVerificationToken:   hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      })
      .select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        message: 'Email is already verified. You can log in.',
      });
    }

    user.isEmailVerified          = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`[verify-email] Verified: ${user.email}`);

    try {
      await sendWelcomeEmail(user.email);
      console.log(`✅ [verify-email] Welcome email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ [verify-email] Failed to send welcome email:', emailErr.message);
    }

    res.status(200).json({
      message: 'Email verified successfully. You can now log in.',
      user: {
        id:              user._id,
        email:           user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });

  } catch (err) {
    console.error('[verify-email]', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── POST /api/auth/resend-verification ────────────────────────────────────────
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
      .select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    const RESEND_COOLDOWN_MS = 60 * 1000;

    if (
      user.lastVerificationEmailSentAt &&
      Date.now() - user.lastVerificationEmailSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      const secondsLeft = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - user.lastVerificationEmailSentAt.getTime())) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${secondsLeft} second(s) before requesting another verification email.`,
      });
    }

    const rawToken    = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);

    user.emailVerificationToken      = hashedToken;
    user.emailVerificationExpires    = Date.now() + 1000 * 60 * 15;
    user.lastVerificationEmailSentAt = new Date();
    await user.save();

    const verificationUrl = buildVerificationUrl(rawToken);

    try {
      await sendVerificationEmail(user.email, verificationUrl);
      console.log(`✅ [resend-verification] Email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ [resend-verification] Failed to send email:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send verification email.' });
    }

    res.json({
      message: 'Verification email resent successfully.',
      _dev_verificationUrl: process.env.NODE_ENV !== 'production'
        ? verificationUrl
        : undefined,
    });

  } catch (err) {
    console.error('[resend-verification]', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
      });
    }

    try {
      await sendLoginNotificationEmail(user.email, {
        ip:     req.ip || req.headers['x-forwarded-for'] || 'Unknown',
        device: req.headers['user-agent'] || 'Unknown',
        time:   new Date().toUTCString(),
      });
      console.log(`✅ [login] Notification email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ [login] Failed to send login notification:', emailErr.message);
    }

    res.json({
      token: generateToken(user._id),
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
    console.error('[login]', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      console.error('[/me] User not found for ID:', req.user._id);
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      id:              user._id,
      email:           user.email,
      phoneNumber:     user.phoneNumber,
      role:            user.role,
      isVerified:      user.isVerified,
      isEmailVerified: user.isEmailVerified,
      totalTradedUSD:  user.totalTradedUSD,
      createdAt:       user.createdAt,
    });

  } catch (err) {
    console.error('[/me]', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    // 60-second cooldown between reset requests
    const COOLDOWN_MS = 60 * 1000;
    if (
      user.passwordResetToken &&
      user.passwordResetExpires &&
      user.passwordResetExpires > Date.now() &&
      Date.now() - (user.passwordResetExpires - 1000 * 60 * 60) < COOLDOWN_MS
    ) {
      return res.status(429).json({
        message: 'Please wait 60 seconds before requesting another reset link.',
      });
    }

    // Generate and store hashed token
    const rawToken    = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Build reset URL
    const base     = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${base}/reset-password?token=${rawToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log(`✅ [forgot-password] Reset email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ [forgot-password] Failed to send email:', emailErr.message);
      // Roll back token so user can try again immediately
      user.passwordResetToken   = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return res.status(500).json({
        message: 'Failed to send reset email. Please try again.',
      });
    }

    res.status(200).json({
      message: 'If that email is registered, a reset link has been sent.',
      _dev_resetUrl: process.env.NODE_ENV !== 'production'
        ? resetUrl
        : undefined,
    });

  } catch (err) {
    console.error('[forgot-password]', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: 'Token and new password are required.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters.',
    });
  }

  try {
    const hashedToken = hashToken(token);

    // select:false fields must be explicitly requested
    const user = await User
      .findOne({
        passwordResetToken:   hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset link. Please request a new one.',
      });
    }

    // Update password and clear reset token
    user.password             = await bcrypt.hash(password, 12);
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log(`[reset-password] Password reset for: ${user.email}`);

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email);
      console.log(`✅ [reset-password] Confirmation email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ [reset-password] Failed to send confirmation:', emailErr.message);
    }

    res.status(200).json({
      message: 'Password reset successfully. You can now log in.',
    });

  } catch (err) {
    console.error('[reset-password]', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
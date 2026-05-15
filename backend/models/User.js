const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ── Core auth ──────────────────────────────────────────────────────
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    password: {
      type:     String,
      required: true,
    },

    role: {
    type:    String,
    enum:    ['user', 'admin', 'moderator'],
    default: 'user',
    },

    // ── Contact ────────────────────────────────────────────────────────
    phoneNumber: {
      type:     String,
      required: true,
      trim:     true,
    },

    // ── KYC / admin verification ───────────────────────────────────────
    isVerified: {
      type:    Boolean,
      default: false,
    },

    // ── Email verification ─────────────────────────────────────────────
    isEmailVerified: {
      type:    Boolean,
      default: false,
    },

    emailVerificationToken: {
      type:   String,
      select: false,
    },

    // ✅ FIX: was missing — Mongoose was silently ignoring this field
    // causing the $gt: Date.now() expiry check in /verify-email to
    // always return null and show "invalid or expired token"
    emailVerificationExpires: {
      type:   Date,
      select: false,
    },

    // ✅ FIX: was missing — the 60-second cooldown in /resend-verification
    // was always undefined so rate limiting never worked
    lastVerificationEmailSentAt: {
      type: Date,
    },
   // backend/models/User.js — add these two fields inside the schema

   passwordResetToken: {
    type:   String,
    select: false,
},

passwordResetExpires: {
  type:   Date,
  select: false,
},
    // ── Trading stats ──────────────────────────────────────────────────
    totalTradedUSD: {
      type:    Number,
      default: 0,
      min:     0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
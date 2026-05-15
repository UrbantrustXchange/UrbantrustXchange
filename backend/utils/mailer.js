const nodemailer = require('nodemailer');

// ── Theme ──────────────────────────────────────────────────────────────────────
const BRAND = {
  name:    'UrbantrustXchange',
  primary: '#F97316',   // orange-500
  dark:    '#C2410C',   // orange-700
  light:   '#FFF7ED',   // orange-50
  border:  '#FED7AA',   // orange-200
  text:    '#111827',
  muted:   '#6b7280',
  subtle:  '#f8f9fa',
  year:    new Date().getFullYear(),
};

// ── Base template wrapper ──────────────────────────────────────────────────────
const baseTemplate = ({ accentColor = BRAND.primary, body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body  { background: #f3f4f6; font-family: Arial, sans-serif; padding: 32px 16px; }
    .wrap { max-width: 540px; margin: 0 auto; background: #ffffff;
            border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .top  { height: 5px; background: ${accentColor}; }
    .header { padding: 28px 36px 20px; border-bottom: 1px solid #f3f4f6;
              display: flex; align-items: center; gap: 10px; }
    .logo-dot { width: 10px; height: 10px; border-radius: 50%;
                background: ${accentColor}; display: inline-block; }
    .logo-text { font-size: 16px; font-weight: 700; color: ${BRAND.text}; }
    .body { padding: 32px 36px; }
    h1    { font-size: 20px; font-weight: 700; color: ${BRAND.text};
            margin-bottom: 10px; line-height: 1.3; }
    p     { font-size: 14px; color: ${BRAND.muted}; line-height: 1.7;
            margin-bottom: 16px; }
    .btn  { display: inline-block; background: ${accentColor};
            color: #ffffff !important; text-decoration: none;
            font-size: 14px; font-weight: 700; padding: 13px 30px;
            border-radius: 8px; margin: 8px 0 20px; }
    .info-box { background: ${BRAND.light}; border: 1px solid ${BRAND.border};
                border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
    .info-box p { margin: 0; color: ${BRAND.text}; font-size: 14px; }
    .info-row { display: flex; justify-content: space-between;
                padding: 8px 0; border-bottom: 1px solid ${BRAND.border};
                font-size: 14px; }
    .info-row:last-child { border-bottom: none; padding-bottom: 0; }
    .info-label { color: ${BRAND.muted}; }
    .info-value { color: ${BRAND.text}; font-weight: 600; }
    .status-badge { display: inline-block; padding: 4px 12px;
                    border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-pending   { background: #FEF9C3; color: #854D0E; }
    .status-reviewing { background: #DBEAFE; color: #1E40AF; }
    .status-paid      { background: #DCFCE7; color: #166534; }
    .status-rejected  { background: #FEE2E2; color: #991B1B; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 20px 0; }
    .url  { font-size: 12px; color: #9ca3af; word-break: break-all;
            margin-top: 12px; line-height: 1.6; }
    .notice { font-size: 13px; color: ${BRAND.muted}; background: #f9fafb;
              border-radius: 8px; padding: 12px 16px; margin-top: 16px;
              border-left: 3px solid ${accentColor}; }
    .foot { padding: 20px 36px; border-top: 1px solid #f3f4f6;
            font-size: 12px; color: #9ca3af; text-align: center;
            line-height: 1.7; background: #fafafa; }
    .foot a { color: ${accentColor}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top"></div>
    <div class="header">
      <span class="logo-dot"></span>
      <span class="logo-text">${BRAND.name}</span>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="foot">
      &copy; ${BRAND.year} ${BRAND.name}. All rights reserved.<br />
      This is an automated message — please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
`;

// ── Transporter ────────────────────────────────────────────────────────────────
const createTransporter = () => {
  const port   = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
     connectionTimeout: 30_000,
     greetingTimeout:   30_000,
     socketTimeout:     35_000,
  });
};

let transporter = null;
const getTransporter = () => {
  if (!transporter) transporter = createTransporter();
  return transporter;
};

// ── Verify connection ──────────────────────────────────────────────────────────
const verifyMailer = async () => {
  try {
    await getTransporter().verify();
    console.log('✅ [mailer] SMTP connection verified successfully');
  } catch (err) {
    console.error('❌ [mailer] SMTP connection verification failed:', err.message);
  }
};

// ── Core send function ─────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text, from, cc, bcc, replyTo }) => {
  const missing = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM']
    .filter(key => !process.env[key]);

  if (missing.length > 0) {
    const msg = `[mailer] Missing env variables: ${missing.join(', ')}`;
    console.error(msg);
    throw new Error(msg);
  }

  if (!to || !subject || !html) {
    const msg = '[mailer] sendEmail requires { to, subject, html }';
    console.error(msg);
    throw new Error(msg);
  }

  const mailOptions = {
    from:    from || process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
    ...(cc      && { cc }),
    ...(bcc     && { bcc }),
    ...(replyTo && { replyTo }),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`✅ [mailer] Sent | to: ${to} | subject: "${subject}" | id: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ [mailer] Failed | to: ${to} | subject: "${subject}" | error: ${err.message}`);
    throw err;
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// ── EMAIL TEMPLATES ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Email Verification ──────────────────────────────────────────────────────
const sendVerificationEmail = async (toEmail, verificationUrl) => {
  const html = baseTemplate({
    body: `
      <h1>Verify Your Email Address</h1>
      <p>Welcome to <strong>${BRAND.name}</strong>! We're excited to have you on board.</p>
      <p>Click the button below to confirm your email address and activate your account.
         This link expires in <strong>15 minutes</strong>.</p>
      <a href="${verificationUrl}" class="btn">Verify My Email</a>
      <p class="url">
        Button not working? Copy and paste this link into your browser:<br />${verificationUrl}
      </p>
      <div class="notice">
        If you did not create an account with ${BRAND.name}, please ignore this email.
        No action is required.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Verify your ${BRAND.name} email address`,
    html,
  });
};

// ── 2. Welcome Email (after email is verified) ─────────────────────────────────
const sendWelcomeEmail = async (toEmail) => {
  const html = baseTemplate({
    body: `
      <h1>Welcome to ${BRAND.name}! 🎉</h1>
      <p>Your email has been verified and your account is now fully active.</p>
      <p>You can now start trading gift cards and Bitcoin on our platform and
         receive payouts directly to your mobile money account.</p>
      <div class="info-box">
        <p><strong>What you can do on ${BRAND.name}:</strong></p>
        <br/>
        <p>🎁 &nbsp; Sell gift cards (Apple, Amazon, Steam & more)</p>
        <p style="margin-top:8px;">₿ &nbsp; Sell Bitcoin instantly</p>
        <p style="margin-top:8px;">📱 &nbsp; Receive payouts via mobile money</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">
        Start Trading
      </a>
      <div class="notice">
        Keep your account secure — never share your password or verification
        codes with anyone, including our support team.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Welcome to ${BRAND.name} — Your account is ready!`,
    html,
  });
};

// ── 3. Password Reset ──────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const html = baseTemplate({
    accentColor: '#F97316',
    body: `
      <h1>Reset Your Password</h1>
      <p>We received a request to reset the password for your <strong>${BRAND.name}</strong>
         account. Click the button below to set a new password.</p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset My Password</a>
      <p class="url">
        Button not working? Copy and paste this link into your browser:<br />${resetUrl}
      </p>
      <div class="notice">
        If you did not request a password reset, please ignore this email.
        Your password will remain unchanged. If you believe someone is trying
        to access your account, contact our support team immediately.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Reset your ${BRAND.name} password`,
    html,
  });
};

// ── 4. Password Changed Confirmation ──────────────────────────────────────────
const sendPasswordChangedEmail = async (toEmail) => {
  const html = baseTemplate({
    body: `
      <h1>Password Changed Successfully</h1>
      <p>This is a confirmation that the password for your <strong>${BRAND.name}</strong>
         account was changed successfully.</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Account</span>
          <span class="info-value">${toEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time</span>
          <span class="info-value">${new Date().toUTCString()}</span>
        </div>
      </div>
      <div class="notice">
        If you did not make this change, please reset your password immediately
        and contact our support team. Do not share your password with anyone.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Your ${BRAND.name} password has been changed`,
    html,
  });
};

// ── 5. Trade Opened ────────────────────────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {object} trade — { tradeId, type, amount, rate, cardType, payout }
 */
const sendTradeOpenedEmail = async (toEmail, trade) => {
  const typeLabel  = trade.type === 'btc' ? 'Bitcoin (BTC)' : `Gift Card — ${trade.cardType}`;
  const amountStr  = trade.type === 'btc' ? `${trade.amount} BTC` : `$${trade.amount}`;
  const payoutStr  = `GHS ${parseFloat(trade.payout).toFixed(2)}`;
  const tradeUrl   = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trade/${trade.tradeId}`;

  const html = baseTemplate({
    body: `
      <h1>Trade Submitted Successfully</h1>
      <p>Your trade has been received and is now <strong>pending review</strong> by our team.
         You will be notified as soon as the status changes.</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Trade ID</span>
          <span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type</span>
          <span class="info-value">${typeLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount</span>
          <span class="info-value">${amountStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Rate</span>
          <span class="info-value">${trade.rate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Expected Payout</span>
          <span class="info-value">${payoutStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value">
            <span class="status-badge status-pending">Pending</span>
          </span>
        </div>
      </div>
      <a href="${tradeUrl}" class="btn">View Trade</a>
      <div class="notice">
        Please complete your trade within <strong>30 minutes</strong>.
        Trades not completed within this window may be cancelled automatically.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Trade submitted — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`,
    html,
  });
};

// ── 6. Trade Status Updated ────────────────────────────────────────────────────
/**
 * @param {string} toEmail
 * @param {object} trade — { tradeId, type, amount, cardType, payout, status, note }
 */
const sendTradeStatusEmail = async (toEmail, trade) => {
  const typeLabel = trade.type === 'btc' ? 'Bitcoin (BTC)' : `Gift Card — ${trade.cardType}`;
  const amountStr = trade.type === 'btc' ? `${trade.amount} BTC` : `$${trade.amount}`;
  const payoutStr = `GHS ${parseFloat(trade.payout).toFixed(2)}`;
  const tradeUrl  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trade/${trade.tradeId}`;

  const statusMap = {
    reviewing: {
      label:   'Under Review',
      badge:   'status-reviewing',
      heading: 'Your Trade is Being Reviewed',
      message: 'Our team is currently reviewing your trade. This usually takes between 15 and 30 minutes. We will notify you once a decision has been made.',
      accent:  '#3B82F6',
    },
    paid: {
      label:   'Paid',
      badge:   'status-paid',
      heading: 'Your Trade Has Been Paid! 🎉',
      message: `Great news — your trade has been approved and your payout of <strong>${payoutStr}</strong> has been sent to your mobile money account. Please allow a few minutes for it to reflect.`,
      accent:  '#16A34A',
    },
    rejected: {
      label:   'Rejected',
      badge:   'status-rejected',
      heading: 'Your Trade Was Rejected',
      message: 'Unfortunately your trade could not be processed. This may be due to an invalid gift card, unreadable image, or failed verification. Please open a dispute or contact support if you believe this is an error.',
      accent:  '#DC2626',
    },
  };

  const info = statusMap[trade.status] || {
    label:   trade.status,
    badge:   'status-pending',
    heading: 'Trade Status Updated',
    message: 'Your trade status has been updated. Please log in to view the latest details.',
    accent:  BRAND.primary,
  };

  const html = baseTemplate({
    accentColor: info.accent,
    body: `
      <h1>${info.heading}</h1>
      <p>${info.message}</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Trade ID</span>
          <span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type</span>
          <span class="info-value">${typeLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount</span>
          <span class="info-value">${amountStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Expected Payout</span>
          <span class="info-value">${payoutStr}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value">
            <span class="status-badge ${info.badge}">${info.label}</span>
          </span>
        </div>
        ${trade.note ? `
        <div class="info-row">
          <span class="info-label">Admin Note</span>
          <span class="info-value">${trade.note}</span>
        </div>` : ''}
      </div>
      <a href="${tradeUrl}" class="btn">View Trade Details</a>
      ${trade.status === 'rejected' ? `
      <div class="notice">
        If you believe your trade was rejected in error, you can open a dispute
        directly from the trade page. Our support team will review your case
        within 24 hours.
      </div>` : ''}
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Trade ${info.label} — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`,
    html,
  });
};

// ── 7. Trade Expired ───────────────────────────────────────────────────────────
const sendTradeExpiredEmail = async (toEmail, trade) => {
  const typeLabel = trade.type === 'btc' ? 'Bitcoin (BTC)' : `Gift Card — ${trade.cardType}`;
  const tradeUrl  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trade/${trade.tradeId}`;

  const html = baseTemplate({
    accentColor: '#F59E0B',
    body: `
      <h1>Your Trade Has Expired</h1>
      <p>Your trade was not completed within the required time window and has
         been automatically cancelled.</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Trade ID</span>
          <span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type</span>
          <span class="info-value">${typeLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value">
            <span class="status-badge status-rejected">Expired</span>
          </span>
        </div>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">
        Start a New Trade
      </a>
      <div class="notice">
        All trades must be completed within 30 minutes of opening.
        If you experienced an issue, please contact our support team.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Trade expired — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`,
    html,
  });
};

// ── 8. Dispute Opened ──────────────────────────────────────────────────────────
const sendDisputeOpenedEmail = async (toEmail, trade) => {
  const tradeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trade/${trade.tradeId}`;

  const html = baseTemplate({
    accentColor: '#F97316',
    body: `
      <h1>Dispute Submitted</h1>
      <p>We have received your dispute for trade
         <strong>#${String(trade.tradeId).slice(-6).toUpperCase()}</strong>.
         Our team will review your case and respond within <strong>24 hours</strong>.</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Trade ID</span>
          <span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dispute Reason</span>
          <span class="info-value">${trade.disputeReason || 'Not specified'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Submitted At</span>
          <span class="info-value">${new Date().toUTCString()}</span>
        </div>
      </div>
      <a href="${tradeUrl}" class="btn">View Trade</a>
      <div class="notice">
        Please do not open multiple disputes for the same trade.
        Admin decisions are final after review. Providing false information
        may result in account suspension.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Dispute received — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`,
    html,
  });
};

// ── 9. Account Deleted ─────────────────────────────────────────────────────────
const sendAccountDeletedEmail = async (toEmail) => {
  const html = baseTemplate({
    accentColor: '#DC2626',
    body: `
      <h1>Account Deleted</h1>
      <p>Your <strong>${BRAND.name}</strong> account has been permanently deleted
         as requested. All your data has been removed from our system.</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Account</span>
          <span class="info-value">${toEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Deleted At</span>
          <span class="info-value">${new Date().toUTCString()}</span>
        </div>
      </div>
      <div class="notice">
        If you did not request this deletion or believe this was done in error,
        please contact our support team immediately. Account deletions cannot
        be undone.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `Your ${BRAND.name} account has been deleted`,
    html,
  });
};

// ── 10. Login Notification ─────────────────────────────────────────────────────
const sendLoginNotificationEmail = async (toEmail, { ip, device, time }) => {
  const html = baseTemplate({
    body: `
      <h1>New Login Detected</h1>
      <p>A new login was detected on your <strong>${BRAND.name}</strong> account.
         If this was you, no action is needed.</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Account</span>
          <span class="info-value">${toEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time</span>
          <span class="info-value">${time || new Date().toUTCString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">IP Address</span>
          <span class="info-value">${ip || 'Unknown'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Device</span>
          <span class="info-value">${device || 'Unknown'}</span>
        </div>
      </div>
      <div class="notice">
        If you did not log in, reset your password immediately and contact
        our support team. Never share your login details with anyone.
      </div>
    `,
  });

  return sendEmail({
    to:      toEmail,
    subject: `New login to your ${BRAND.name} account`,
    html,
  });
};

// ── Exports ────────────────────────────────────────────────────────────────────
module.exports = {
  sendEmail,
  verifyMailer,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendTradeOpenedEmail,
  sendTradeStatusEmail,
  sendTradeExpiredEmail,
  sendDisputeOpenedEmail,
  sendAccountDeletedEmail,
  sendLoginNotificationEmail,
};
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'UrbantrustXchange <onboarding@resend.dev>';

// ── Theme ──────────────────────────────────────────────────────────────────────
const BRAND = {
  name:    'UrbantrustXchange',
  primary: '#F97316',
  dark:    '#C2410C',
  light:   '#FFF7ED',
  border:  '#FED7AA',
  text:    '#111827',
  muted:   '#6b7280',
  year:    new Date().getFullYear(),
};

// ── Base template ──────────────────────────────────────────────────────────────
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
    .url  { font-size: 12px; color: #9ca3af; word-break: break-all;
            margin-top: 12px; line-height: 1.6; }
    .notice { font-size: 13px; color: ${BRAND.muted}; background: #f9fafb;
              border-radius: 8px; padding: 12px 16px; margin-top: 16px;
              border-left: 3px solid ${accentColor}; }
    .foot { padding: 20px 36px; border-top: 1px solid #f3f4f6;
            font-size: 12px; color: #9ca3af; text-align: center;
            line-height: 1.7; background: #fafafa; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top"></div>
    <div class="header">
      <span class="logo-dot"></span>
      <span class="logo-text">${BRAND.name}</span>
    </div>
    <div class="body">${body}</div>
    <div class="foot">
      &copy; ${BRAND.year} ${BRAND.name}. All rights reserved.<br />
      This is an automated message — please do not reply.
    </div>
  </div>
</body>
</html>
`;

// ── Core send ──────────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      [to],
      subject,
      html,
    });
    if (error) {
      console.error(`❌ [mailer] Failed | to: ${to} | error:`, error);
      throw new Error(error.message);
    }
    console.log(`✅ [mailer] Sent | to: ${to} | subject: "${subject}" | id: ${data.id}`);
    return data;
  } catch (err) {
    console.error(`❌ [mailer] Error | to: ${to} | ${err.message}`);
    throw err;
  }
};

// ── Verify ─────────────────────────────────────────────────────────────────────
const verifyMailer = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ [mailer] RESEND_API_KEY is missing');
    return;
  }
  console.log('✅ [mailer] Resend configured successfully');
};

// ── 1. Verification ────────────────────────────────────────────────────────────
const sendVerificationEmail = async (toEmail, verificationUrl) => {
  const html = baseTemplate({
    body: `
      <h1>Verify Your Email Address</h1>
      <p>Welcome to <strong>${BRAND.name}</strong>! We're excited to have you on board.</p>
      <p>Click the button below to confirm your email and activate your account.
         This link expires in <strong>15 minutes</strong>.</p>
      <a href="${verificationUrl}" class="btn">Verify My Email</a>
      <p class="url">Button not working? Copy this link:<br />${verificationUrl}</p>
      <div class="notice">If you did not create an account, please ignore this email.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Verify your ${BRAND.name} email address`, html });
};

// ── 2. Welcome ─────────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (toEmail) => {
  const html = baseTemplate({
    body: `
      <h1>Welcome to ${BRAND.name}! 🎉</h1>
      <p>Your email has been verified and your account is now fully active.</p>
      <div class="info-box">
        <p><strong>What you can do:</strong></p><br/>
        <p>🎁 &nbsp; Sell gift cards (Apple, Amazon, Steam & more)</p>
        <p style="margin-top:8px;">₿ &nbsp; Sell Bitcoin instantly</p>
        <p style="margin-top:8px;">📱 &nbsp; Receive payouts via mobile money</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'https://warm-shortbread-868f3f.netlify.app'}" class="btn">Start Trading</a>
      <div class="notice">Never share your password or verification codes with anyone.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Welcome to ${BRAND.name} — Your account is ready!`, html });
};

// ── 3. Password Reset ──────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const html = baseTemplate({
    body: `
      <h1>Reset Your Password</h1>
      <p>Click below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset My Password</a>
      <p class="url">Button not working? Copy this link:<br />${resetUrl}</p>
      <div class="notice">If you did not request this, ignore this email.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Reset your ${BRAND.name} password`, html });
};

// ── 4. Password Changed ────────────────────────────────────────────────────────
const sendPasswordChangedEmail = async (toEmail) => {
  const html = baseTemplate({
    body: `
      <h1>Password Changed Successfully</h1>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Account</span><span class="info-value">${toEmail}</span></div>
        <div class="info-row"><span class="info-label">Time</span><span class="info-value">${new Date().toUTCString()}</span></div>
      </div>
      <div class="notice">If you did not make this change, reset your password immediately.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Your ${BRAND.name} password has been changed`, html });
};

// ── 5. Trade Opened ────────────────────────────────────────────────────────────
const sendTradeOpenedEmail = async (toEmail, trade) => {
  const typeLabel = trade.type === 'btc' ? 'Bitcoin (BTC)' : `Gift Card — ${trade.cardType}`;
  const amountStr = trade.type === 'btc' ? `${trade.amount} BTC` : `$${trade.amount}`;
  const payoutStr = `GHS ${parseFloat(trade.payout).toFixed(2)}`;
  const tradeUrl  = `${process.env.FRONTEND_URL || 'https://warm-shortbread-868f3f.netlify.app'}/trade/${trade.tradeId}`;
  const html = baseTemplate({
    body: `
      <h1>Trade Submitted Successfully</h1>
      <p>Your trade is now <strong>pending review</strong>. You will be notified when the status changes.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Trade ID</span><span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span></div>
        <div class="info-row"><span class="info-label">Type</span><span class="info-value">${typeLabel}</span></div>
        <div class="info-row"><span class="info-label">Amount</span><span class="info-value">${amountStr}</span></div>
        <div class="info-row"><span class="info-label">Expected Payout</span><span class="info-value">${payoutStr}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="status-badge status-pending">Pending</span></span></div>
      </div>
      <a href="${tradeUrl}" class="btn">View Trade</a>
      <div class="notice">Please complete your trade within <strong>30 minutes</strong>.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Trade submitted — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`, html });
};

// ── 6. Trade Status ────────────────────────────────────────────────────────────
const sendTradeStatusEmail = async (toEmail, trade) => {
  const typeLabel = trade.type === 'btc' ? 'Bitcoin (BTC)' : `Gift Card — ${trade.cardType}`;
  const amountStr = trade.type === 'btc' ? `${trade.amount} BTC` : `$${trade.amount}`;
  const payoutStr = `GHS ${parseFloat(trade.payout).toFixed(2)}`;
  const tradeUrl  = `${process.env.FRONTEND_URL || 'https://warm-shortbread-868f3f.netlify.app'}/trade/${trade.tradeId}`;
  const statusMap = {
    reviewing: { label: 'Under Review', badge: 'status-reviewing', heading: 'Your Trade is Being Reviewed', message: 'Our team is reviewing your trade. This usually takes 15–30 minutes.', accent: '#3B82F6' },
    paid:      { label: 'Paid',         badge: 'status-paid',      heading: 'Your Trade Has Been Paid! 🎉', message: `Your payout of <strong>${payoutStr}</strong> has been sent to your mobile money account.`, accent: '#16A34A' },
    rejected:  { label: 'Rejected',     badge: 'status-rejected',  heading: 'Your Trade Was Rejected',      message: 'Your trade could not be processed. Please open a dispute if you believe this is an error.', accent: '#DC2626' },
  };
  const info = statusMap[trade.status] || { label: trade.status, badge: 'status-pending', heading: 'Trade Status Updated', message: 'Your trade status has been updated.', accent: BRAND.primary };
  const html = baseTemplate({
    accentColor: info.accent,
    body: `
      <h1>${info.heading}</h1>
      <p>${info.message}</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Trade ID</span><span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span></div>
        <div class="info-row"><span class="info-label">Type</span><span class="info-value">${typeLabel}</span></div>
        <div class="info-row"><span class="info-label">Amount</span><span class="info-value">${amountStr}</span></div>
        <div class="info-row"><span class="info-label">Payout</span><span class="info-value">${payoutStr}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="status-badge ${info.badge}">${info.label}</span></span></div>
        ${trade.note ? `<div class="info-row"><span class="info-label">Admin Note</span><span class="info-value">${trade.note}</span></div>` : ''}
      </div>
      <a href="${tradeUrl}" class="btn">View Trade</a>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Trade ${info.label} — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`, html });
};

// ── 7. Trade Expired ───────────────────────────────────────────────────────────
const sendTradeExpiredEmail = async (toEmail, trade) => {
  const typeLabel = trade.type === 'btc' ? 'Bitcoin (BTC)' : `Gift Card — ${trade.cardType}`;
  const html = baseTemplate({
    accentColor: '#F59E0B',
    body: `
      <h1>Your Trade Has Expired</h1>
      <p>Your trade was not completed within 30 minutes and has been cancelled.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Trade ID</span><span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span></div>
        <div class="info-row"><span class="info-label">Type</span><span class="info-value">${typeLabel}</span></div>
      </div>
      <a href="${process.env.FRONTEND_URL || 'https://warm-shortbread-868f3f.netlify.app'}" class="btn">Start a New Trade</a>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Trade expired — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`, html });
};

// ── 8. Dispute Opened ──────────────────────────────────────────────────────────
const sendDisputeOpenedEmail = async (toEmail, trade) => {
  const tradeUrl = `${process.env.FRONTEND_URL || 'https://warm-shortbread-868f3f.netlify.app'}/trade/${trade.tradeId}`;
  const html = baseTemplate({
    body: `
      <h1>Dispute Submitted</h1>
      <p>We received your dispute for trade <strong>#${String(trade.tradeId).slice(-6).toUpperCase()}</strong>. Our team will respond within <strong>24 hours</strong>.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Trade ID</span><span class="info-value">#${String(trade.tradeId).slice(-6).toUpperCase()}</span></div>
        <div class="info-row"><span class="info-label">Reason</span><span class="info-value">${trade.disputeReason || 'Not specified'}</span></div>
        <div class="info-row"><span class="info-label">Submitted</span><span class="info-value">${new Date().toUTCString()}</span></div>
      </div>
      <a href="${tradeUrl}" class="btn">View Trade</a>
      <div class="notice">Admin decisions are final after review.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Dispute received — #${String(trade.tradeId).slice(-6).toUpperCase()} | ${BRAND.name}`, html });
};

// ── 9. Account Deleted ─────────────────────────────────────────────────────────
const sendAccountDeletedEmail = async (toEmail) => {
  const html = baseTemplate({
    accentColor: '#DC2626',
    body: `
      <h1>Account Deleted</h1>
      <p>Your <strong>${BRAND.name}</strong> account has been permanently deleted.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Account</span><span class="info-value">${toEmail}</span></div>
        <div class="info-row"><span class="info-label">Deleted At</span><span class="info-value">${new Date().toUTCString()}</span></div>
      </div>
      <div class="notice">If this was not you, contact support immediately.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `Your ${BRAND.name} account has been deleted`, html });
};

// ── 10. Login Notification ─────────────────────────────────────────────────────
const sendLoginNotificationEmail = async (toEmail, { ip, device, time }) => {
  const html = baseTemplate({
    body: `
      <h1>New Login Detected</h1>
      <p>A new login was detected on your <strong>${BRAND.name}</strong> account.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Account</span><span class="info-value">${toEmail}</span></div>
        <div class="info-row"><span class="info-label">Time</span><span class="info-value">${time || new Date().toUTCString()}</span></div>
        <div class="info-row"><span class="info-label">IP Address</span><span class="info-value">${ip || 'Unknown'}</span></div>
        <div class="info-row"><span class="info-label">Device</span><span class="info-value">${device || 'Unknown'}</span></div>
      </div>
      <div class="notice">If you did not log in, reset your password immediately.</div>
    `,
  });
  return sendEmail({ to: toEmail, subject: `New login to your ${BRAND.name} account`, html });
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
require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const mongoose      = require('mongoose');
const path          = require('path');
const helmet        = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit     = require('express-rate-limit');

const authRoutes  = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const cardRoutes  = require('./routes/cards');
const chatRoutes  = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const userRoutes  = require('./routes/users');

const { verifyMailer } = require('./utils/mailer');

const app = express();

// ── Trust proxy (needed for rate limiter IP detection on Render/Heroku) ────────
app.set('trust proxy', 1);

// ── Security headers ───────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow /uploads images
    contentSecurityPolicy: false,                          // let frontend handle CSP
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── NoSQL injection sanitization ──────────────────────────────────────────────
app.use(mongoSanitize());

// ── Rate limiters ──────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests from this IP. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests from this IP. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const tradeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many trade requests. Please wait before submitting again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Static: uploaded images ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',   authLimiter,    authRoutes);
app.use('/api/trades', tradeLimiter,   tradeRoutes);
app.use('/api/cards',  generalLimiter, cardRoutes);
app.use('/api/chat',   generalLimiter, chatRoutes);
app.use('/api/admin',  generalLimiter, adminRoutes);
app.use('/api/users',  generalLimiter, userRoutes);

// ── Serve React build in production ───────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuild));
  // All non-API routes → React app
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return;
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
} else {
  // Development health check
  app.get('/', (_req, res) => {
    res.json({ message: 'UrbantrustXchange API is running ✅', env: process.env.NODE_ENV });
  });
}

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ── Global error handler ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ [server] Unhandled error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });

  if (err.message === 'Only image files are allowed')
    return res.status(400).json({ message: err.message });

  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ message: 'Invalid token.' });

  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ message: 'Token has expired.' });

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages[0], errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ message: `An account with this ${field} already exists.` });
  }

  res.status(500).json({ message: 'Server error. Please try again later.' });
});

// ── Validate critical env vars ────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missingEnv   = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required env vars: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await verifyMailer();
    app.listen(PORT, () =>
      console.log(`🚀 UrbantrustXchange API → http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  });

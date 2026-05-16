# UrbantrustXchange

A secure peer-to-peer platform for selling gift cards and Bitcoin, with instant GHS payouts via mobile money.

---

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Nodemailer, JWT, Multer
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router v6

---

## Project Structure

```
UrbantrustXchange/
├── backend/
│   ├── middleware/       auth.js, upload.js
│   ├── models/           User, Trade, GiftCard, ChatMessage
│   ├── routes/           auth, trades, cards, chat, admin, users
│   ├── utils/            mailer.js
│   ├── uploads/          trade proof images (git-ignored)
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── context/      AuthContext.jsx
    │   ├── components/   Navbar, StatusBadge
    │   └── pages/        Home, Login, Register, SellBTC, SellGiftCard,
    │                     History, TradeDetail, AdminPanel, Settings,
    │                     VerifyEmail, VerifyNotice, ForgotPassword,
    │                     ResetPassword, Rules
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Local Development Setup

### 1. Clone / unzip and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd frontend
npm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your real values
```

Required `.env` variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing (64+ random chars) |
| `EMAIL_HOST` | SMTP host (e.g. smtpout.secureserver.net) |
| `EMAIL_PORT` | SMTP port (465 for SSL, 587 for TLS) |
| `EMAIL_USER` | Sender email address |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | Formatted from address |
| `FRONTEND_URL` | Frontend URL for email links |
| `BTC_WALLET` | Your Bitcoin receiving wallet address |
| `BTC_RATE_GHS` | Initial BTC/GHS exchange rate |

### 3. Seed the database

```bash
cd backend
node seed.js
```

This creates:
- All gift card types with default rates
- Admin user: `admin@urbantrustxchange.com` / `Admin@UTX2024!`

> ⚠️ **Change the admin password after first login!**

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Backend:  https://urbantrustxchange.onrender.com
- Frontend:  https://urbantrustxchange.onrender.com
---

## Production Deployment (Render.com — Recommended)

### Backend (Web Service)

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `node server.js` |
| Node version | 18+ |

Add all `.env` variables in the Render dashboard under **Environment**.

After first deploy, run seed via Render Shell:
```bash
node seed.js
```

### Frontend (Static Site)

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

Set environment variable:
```
VITE_API_URL=https://your-backend.onrender.com
```

Update `vite.config.js` proxy target to your backend URL for production builds.

---

## Deployment (Railway / Heroku / VPS)

For monorepo deployments where backend serves frontend:

```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Start backend (serves /dist in production)
cd ../backend
NODE_ENV=production node server.js
```

The backend automatically serves the React build when `NODE_ENV=production`.

---

## Admin Panel

URL: `/admin` (requires admin role)

Features:
- **Trades** — search, filter, update status with admin notes
- **Gift Cards** — update rates, enable/disable, set risk level
- **Users** — list all users, toggle KYC verification
- **BTC Rate** — update live BTC/GHS rate

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Trades
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trades` | Create new trade |
| GET | `/api/trades` | Get user's trades (paginated) |
| GET | `/api/trades/:id` | Get single trade |
| POST | `/api/trades/:id/dispute` | Open dispute |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cards` | Get enabled gift cards |
| GET | `/api/cards/all` | Get all cards (admin) |
| PUT | `/api/cards/:id` | Update card (admin) |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/:tradeId` | Get trade messages |
| POST | `/api/chat/:tradeId` | Send message |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/trades` | All trades |
| GET | `/api/admin/trades/:id` | Single trade detail |
| PATCH | `/api/admin/trades/:id/status` | Update trade status |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id/verify` | Toggle KYC |
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/btc-rate` | Current BTC rate |
| PATCH | `/api/admin/btc-rate` | Update BTC rate |

### Users
| Method | Endpoint | Description |
|---|---|---|
| PUT | `/api/users/profile` | Update phone number |
| PUT | `/api/users/change-password` | Change password |
| DELETE | `/api/users/account` | Delete account |

---

## Security Features

- JWT authentication with 7-day expiry
- Email verification required before trading
- bcrypt password hashing (12 rounds)
- Rate limiting (auth: 10/15min, trades: 20/15min, general: 100/15min)
- Helmet security headers
- MongoDB injection sanitization
- CORS restricted to frontend URL
- File upload restricted to images only (5MB max)
- Admin-only routes protected by role middleware

---

## Email Notifications

All emails use branded HTML templates:

1. Email verification
2. Welcome (after verification)
3. Login notification
4. Password reset
5. Password changed confirmation
6. Trade opened
7. Trade status updated (reviewing / paid / rejected)
8. Trade expired
9. Dispute opened
10. Account deleted

---

## License

Private — UrbantrustXchange © 2024. All rights reserved.

// frontend/src/pages/Home.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/trades', { params: { page: 1, limit: 5 } })
      .then(r => {
        // Handle both old (array) and new (paginated) API response
        const list = Array.isArray(r.data) ? r.data : r.data.trades;
        setTrades(list.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          boxShadow: '0 8px 32px rgba(249,115,22,0.30)',
        }}
      >
        {/* Faint pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='11' font-weight='800' fill='%23ffffff' fill-opacity='0.07' transform='rotate(-20 100 40)'%3EUrbantrustXchange%3C%2Ftext%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
                          rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-medium">
              Platform is live
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back{user?.email
              ? `, ${user.email.split('@')[0]}`
              : ''
            }! 👋
          </h1>
          <p className="text-orange-100 text-sm max-w-xs mx-auto leading-relaxed">
            Sell gift cards & crypto and get paid instantly via mobile money in GHS
          </p>

          {/* Stats row */}
          {user && (
            <div className="flex items-center justify-center gap-6 mt-5">
              <div className="text-center">
                <p className="text-white/70 text-xs mb-0.5">Total Traded</p>
                <p className="text-white font-bold text-base">
                  ${user.totalTradedUSD?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white/70 text-xs mb-0.5">Account</p>
                <p className="text-white font-bold text-base capitalize">
                  {user.role}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white/70 text-xs mb-0.5">Status</p>
                <p className="text-white font-bold text-base">
                  {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action cards ── */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase
                      tracking-widest mb-3">
          Start a trade
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">

        {/* Sell Gift Card */}
        <Link
          to="/sell/giftcard"
          className="group bg-white rounded-2xl p-5 text-center
                     border border-orange-100 transition-all duration-200
                     hover:-translate-y-0.5 active:scale-[0.97]"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.20)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(249,115,22,0.08)'}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center
                       text-2xl mx-auto mb-3 transition-transform
                       group-hover:scale-110 duration-200"
            style={{ background: 'linear-gradient(135deg, #ffedd5, #fed7aa)' }}
          >
            🎁
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">
            Sell Gift Card
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Apple, Amazon, Steam & more
          </p>
          <div
            className="mt-3 text-xs font-semibold text-brand-500
                       flex items-center justify-center gap-1
                       group-hover:gap-2 transition-all duration-200"
          >
            Start trading
            <svg width="12" height="12" fill="none" stroke="currentColor"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>

        {/* Sell Bitcoin */}
        <Link
          to="/sell/btc"
          className="group bg-white rounded-2xl p-5 text-center
                     border border-orange-100 transition-all duration-200
                     hover:-translate-y-0.5 active:scale-[0.97]"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.20)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(249,115,22,0.08)'}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center
                       text-2xl mx-auto mb-3 transition-transform
                       group-hover:scale-110 duration-200"
            style={{ background: 'linear-gradient(135deg, #FEF9C3, #FEF08A)' }}
          >
            ₿
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">
            Sell Bitcoin
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Instant BTC to GHS payout
          </p>
          <div
            className="mt-3 text-xs font-semibold text-brand-500
                       flex items-center justify-center gap-1
                       group-hover:gap-2 transition-all duration-200"
          >
            Start trading
            <svg width="12" height="12" fill="none" stroke="currentColor"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>
      </div>

      {/* ── Info strip ── */}
      <div
        className="rounded-2xl px-4 py-3 mb-8 flex items-center
                   justify-between gap-4 flex-wrap"
        style={{
          background: '#fffbf7',
          border: '1px solid #ffedd5',
        }}
      >
        {[
          { icon: '⚡', label: 'Fast Payouts',    sub: 'Mobile money' },
          { icon: '🔒', label: 'Secure Platform', sub: 'Verified trades' },
          { icon: '💬', label: '24/7 Support',    sub: 'In-trade chat' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                {item.label}
              </p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent trades ── */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-36 bg-orange-100 rounded animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-orange-100 px-4 py-4
                         flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-orange-100 rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-orange-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 w-16 bg-orange-100 rounded animate-pulse ml-auto" />
                <div className="h-4 w-14 bg-orange-50 rounded-full animate-pulse ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : trades.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400
                          uppercase tracking-widest">
              Recent Transactions
            </p>
            <Link
              to="/history"
              className="text-xs font-semibold text-brand-500
                         hover:text-brand-600 flex items-center gap-1
                         transition-colors"
            >
              View all
              <svg width="12" height="12" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div
            className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
          >
            {trades.map((t, i) => (
              <Link
                to={`/trade/${t._id}`}
                key={t._id}
                className={`
                  flex items-center justify-between px-4 py-3.5
                  hover:bg-orange-50 transition-all duration-150 group
                  ${i !== trades.length - 1 ? 'border-b border-orange-50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center
                               justify-center text-base shrink-0"
                    style={{
                      background: t.type === 'btc'
                        ? 'linear-gradient(135deg, #FEF9C3, #FEF08A)'
                        : 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                    }}
                  >
                    {t.type === 'btc' ? '₿' : '🎁'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {t.type === 'btc'
                        ? `Bitcoin · ${t.amount} BTC`
                        : `${t.card_type} · $${t.amount}`
                      }
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(t.created_at).toLocaleDateString('en-GH', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-gray-900">
                    GHS {(t.amount * t.rate).toFixed(2)}
                  </p>
                  <div className="mt-0.5">
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* No trades yet — show a subtle prompt */
        <div
          className="rounded-2xl border border-orange-100 px-5 py-6
                     text-center bg-white"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.06)' }}
        >
          <p className="text-sm text-gray-400 mb-1">No transactions yet</p>
          <p className="text-xs text-gray-400">
            Your recent trades will appear here.
          </p>
        </div>
      )}

    </div>
  );
}
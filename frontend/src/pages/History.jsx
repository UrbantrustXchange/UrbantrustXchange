// frontend/src/pages/History.jsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const LIMIT = 20;

// ── Notification sound (plays when new message arrives while on this page) ────
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode   = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {}
};

export default function History() {
  const navigate = useNavigate();

  const [trades,      setTrades]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState('');
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState(null);

  // Track message counts per trade to detect new messages
  const [messageCounts, setMessageCounts] = useState({});
  const prevMessageCounts = useRef({});

  // ── Fetch trades ──────────────────────────────────────────────────────────────
  const fetchTrades = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data } = await axios.get('/api/trades', {
        params: { page: pageNum, limit: LIMIT },
      });

      if (Array.isArray(data)) {
        setTrades(data);
        setPagination(null);
      } else {
        setTrades(prev => append ? [...prev, ...data.trades] : data.trades);
        setPagination(data.pagination);
      }

      setError('');
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
      console.error('[History]', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades(1, false);
  }, [fetchTrades]);

  // ── Poll for new messages on active (non-paid/rejected) trades ────────────────
  useEffect(() => {
    if (trades.length === 0) return;

    const activeTrades = trades.filter(
      t => !['paid', 'rejected'].includes(t.status)
    );

    if (activeTrades.length === 0) return;

    const checkMessages = async () => {
      for (const trade of activeTrades) {
        try {
          const { data } = await axios.get(`/api/chat/${trade._id}`);
          const count = Array.isArray(data) ? data.length : 0;

          setMessageCounts(prev => {
            const newCounts = { ...prev, [trade._id]: count };

            // Play sound if message count increased and last message is from support
            const prevCount = prevMessageCounts.current[trade._id] ?? count;
            if (count > prevCount && Array.isArray(data) && data.length > 0) {
              const lastMsg = data[data.length - 1];
              if (lastMsg.sender_role !== 'user') {
                playNotificationSound();
              }
            }

            prevMessageCounts.current = { ...prevMessageCounts.current, [trade._id]: count };
            return newCounts;
          });
        } catch {}
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 15000);
    return () => clearInterval(interval);
  }, [trades]);

  // ── Load more ─────────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchTrades(nextPage, true);
  };

  const hasMore = pagination ? pagination.page < pagination.pages : false;
  const totalCount = pagination ? pagination.total : trades.length;

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-orange-100 rounded-lg animate-pulse" />
          <div className="h-4 w-16 bg-orange-100 rounded-lg animate-pulse" />
        </div>
        <div
          className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-4
                         ${i !== 4 ? 'border-b border-orange-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3.5 w-32 bg-orange-100 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-orange-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-3.5 w-20 bg-orange-100 rounded animate-pulse ml-auto" />
                <div className="h-5 w-16 bg-orange-50 rounded-full animate-pulse ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Transactions</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Your complete trading history
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-semibold
                     text-brand-600 border border-orange-200 bg-orange-50"
        >
          {totalCount} trade{totalCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200
                        rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
          <svg width="15" height="15" fill="none" stroke="currentColor"
            strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"    y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button
            onClick={() => fetchTrades(1, false)}
            className="ml-auto text-xs font-medium text-red-600
                       hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!error && trades.length === 0 && (
        <div
          className="bg-white rounded-2xl border border-orange-100
                     text-center py-16 px-6"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center
                       mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}
          >
            <svg width="28" height="28" fill="none" stroke="#f97316"
              strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0
                   002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0
                   002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No trades yet
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Your transaction history will appear here once you start trading.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold
                       text-white px-5 py-2.5 rounded-xl transition-all
                       active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '0 4px 12px rgba(249,115,22,0.30)',
            }}
          >
            Start your first trade
            <svg width="14" height="14" fill="none" stroke="currentColor"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}

      {/* ── Trade list ── */}
      {trades.length > 0 && (
        <>
          <div
            className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
          >
            {/* Table header */}
            <div
              className="hidden sm:grid grid-cols-4 px-4 py-2.5 text-xs
                         font-semibold text-gray-400 uppercase tracking-wider"
              style={{ background: '#fffbf7', borderBottom: '1px solid #ffedd5' }}
            >
              <span>Trade</span>
              <span>Date</span>
              <span className="text-right">Payout</span>
              <span className="text-right">Status</span>
            </div>

            {trades.map((t, i) => {
              const msgCount = messageCounts[t._id] || 0;
              const hasMessages = msgCount > 0;
              const isActive = !['paid', 'rejected'].includes(t.status);

              return (
                <div
                  key={t._id}
                  className={`${i !== trades.length - 1 ? 'border-b border-orange-50' : ''}`}
                >
                  {/* ── Trade row ── */}
                  <Link
                    to={`/trade/${t._id}`}
                    className="flex items-center justify-between px-4 py-4
                               hover:bg-orange-50 transition-all duration-150 group"
                  >
                    {/* Left — icon + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon with unread dot */}
                      <div className="relative shrink-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center
                                     justify-center text-base"
                          style={{
                            background: t.type === 'btc'
                              ? 'linear-gradient(135deg, #FEF9C3, #FEF08A)'
                              : 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                          }}
                        >
                          {t.type === 'btc' ? '₿' : '🎁'}
                        </div>
                        {/* Unread message indicator */}
                        {hasMessages && isActive && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                                       flex items-center justify-center text-white
                                       text-[9px] font-bold"
                            style={{ background: '#f97316', border: '2px solid white' }}
                          >
                            {msgCount > 9 ? '9+' : msgCount}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {t.type === 'btc'
                            ? `Bitcoin · ${t.amount} BTC`
                            : `${t.card_type} · $${t.amount}`
                          }
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(t.created_at).toLocaleDateString('en-GH', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                          <span className="mx-1">·</span>
                          Rate: {t.rate}
                        </p>
                      </div>
                    </div>

                    {/* Right — payout + status + arrow */}
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          GHS {(t.amount * t.rate).toFixed(2)}
                        </p>
                        <div className="mt-0.5 flex justify-end">
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                      <svg
                        width="14" height="14" fill="none" stroke="currentColor"
                        strokeWidth="2.5" viewBox="0 0 24 24"
                        className="text-gray-300 group-hover:text-brand-400
                                   transition-colors shrink-0"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>

                  {/* ── Open Chat button — shown on active trades ── */}
                  {isActive && (
                    <div className="px-4 pb-3">
                      <button
                        onClick={() => navigate(`/trade/${t._id}`)}
                        className="flex items-center gap-2 text-xs font-semibold
                                   px-3 py-2 rounded-xl w-full justify-center
                                   transition-all active:scale-[0.98]"
                        style={{
                          background: hasMessages
                            ? 'linear-gradient(135deg, #f97316, #ea580c)'
                            : '#fff7ed',
                          color:  hasMessages ? 'white' : '#c2410c',
                          border: hasMessages ? 'none' : '1px solid #fed7aa',
                          boxShadow: hasMessages
                            ? '0 2px 8px rgba(249,115,22,0.25)' : 'none',
                        }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor"
                          strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03
                               8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
                               15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {hasMessages
                          ? `${msgCount} message${msgCount !== 1 ? 's' : ''} — Open Chat`
                          : 'Open Trade Chat'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {pagination && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-medium text-gray-600">{trades.length}</span>
                {' '}of{' '}
                <span className="font-medium text-gray-600">{pagination.total}</span>
                {' '}trades
              </p>

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 text-sm font-semibold
                             text-brand-600 border border-orange-200
                             bg-orange-50 hover:bg-orange-100
                             px-4 py-2 rounded-xl transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none"
                        viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more
                      <svg width="14" height="14" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
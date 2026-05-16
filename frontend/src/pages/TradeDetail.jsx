// frontend/src/pages/TradeDetail.jsx

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const SAFETY_NOTICES = [
  'All trades are monitored by the platform',
  'Submitting invalid gift cards or fake payment proofs will result in account suspension',
  'Admin decisions are final after review',
];

const TRADE_DURATION = 1800;

function useCountdown(startSeconds) {
  const [timeLeft, setTimeLeft] = useState(startSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const minutes    = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds    = String(timeLeft % 60).padStart(2, '0');
  const isExpired  = timeLeft === 0;
  const isUrgent   = timeLeft <= 300 && timeLeft > 0;
  const isCritical = timeLeft <= 60  && timeLeft > 0;
  const progress   = ((TRADE_DURATION - timeLeft) / TRADE_DURATION) * 100;

  return { minutes, seconds, isExpired, isUrgent, isCritical, timeLeft, progress };
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 animate-fade-in">
      <div className="h-4 w-28 bg-orange-100 rounded-lg animate-pulse" />
      <div className="bg-white rounded-2xl border border-orange-100 p-5 space-y-3">
        <div className="h-5 w-48 bg-orange-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-orange-50 rounded-xl p-3 space-y-2">
              <div className="h-2.5 w-12 bg-orange-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-orange-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-orange-100 h-64 animate-pulse" />
    </div>
  );
}

export default function TradeDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [trade,     setTrade]     = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState('');
  const [image,     setImage]     = useState(null);
  const [sending,   setSending]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Dispute
  const [disputeOpen,      setDisputeOpen]      = useState(false);
  const [disputeText,      setDisputeText]      = useState('');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [disputeLoading,   setDisputeLoading]   = useState(false);
  const [disputeError,     setDisputeError]     = useState('');

  const bottomRef  = useRef(null);
  const disputeRef = useRef(null);

  const { minutes, seconds, isExpired, isUrgent, isCritical, progress } =
    useCountdown(TRADE_DURATION);

  const fetchMessages = () =>
    axios.get(`/api/chat/${id}`)
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : [];
        setMessages(data);
      })
      .catch(() => {});

  useEffect(() => {
   axios.get(`/api/trades/${id}`)
      .then(r => {
        if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
          setTrade(r.data);
        }
      })
      .catch(() => {});
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (disputeOpen && !disputeSubmitted) {
      setTimeout(() =>
        disputeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      , 100);
    }
  }, [disputeOpen]);

  const send = async () => {
    if (!text.trim() && !image) return;
    if (isExpired) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append('message', text.trim());
      if (image) fd.append('image', image);
      await axios.post(`/api/chat/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setText('');
      setImage(null);
      fetchMessages();
    } catch {}
    finally { setSending(false); }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeText.trim())
      return setDisputeError('Please describe your issue before submitting.');
    if (disputeText.trim().length < 20)
      return setDisputeError('Please provide more detail (at least 20 characters).');

    setDisputeError('');
    setDisputeLoading(true);
    try {
      await axios.post(`/api/trades/${id}/dispute`, {
        reason: disputeText.trim(),
      });
      setDisputeSubmitted(true);
    } catch (err) {
      setDisputeError(
        err.response?.data?.message || 'Failed to submit dispute. Please try again.'
      );
    } finally {
      setDisputeLoading(false);
    }
  };

  // ── Timer styles ───────────────────────────────────────────────────────────
  const timerStyle = isExpired || isCritical
    ? { bg: '#FEF2F2', border: '#FECACA', accent: '#EF4444',
        text: '#991B1B', badge: '#FEE2E2', badgeBorder: '#FECACA' }
    : isUrgent
      ? { bg: '#FFF7ED', border: '#FED7AA', accent: '#F97316',
          text: '#C2410C', badge: '#FFEDD5', badgeBorder: '#FED7AA' }
      : { bg: '#FFFBF7', border: '#FED7AA', accent: '#F97316',
          text: '#C2410C', badge: '#FFF7ED', badgeBorder: '#FFEDD5' };

  if (!trade) return <Skeleton />;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 animate-fade-in">

      {/* ── Back link ── */}
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm font-medium
                   text-gray-400 hover:text-brand-500 transition-colors"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor"
          strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 19l-7-7 7-7" />
        </svg>
        Back to history
      </Link>

      {/* ── Safety notice ── */}
      {!dismissed && (
        <div
          className="rounded-2xl overflow-hidden animate-slide-up"
          style={{ border: '1px solid #FECACA', background: '#FEF2F2' }}
        >
          <div
            className="h-1"
            style={{ background: 'linear-gradient(90deg, #EF4444, #DC2626)' }}
          />
          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center
                             justify-center shrink-0"
                  style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}
                >
                  <svg width="15" height="15" fill="none" stroke="#EF4444"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71
                         3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-800">
                    Trade Safety Notice
                  </h3>
                  <p className="text-xs text-red-500 mt-0.5">
                    Please read before proceeding
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="shrink-0 text-red-300 hover:text-red-500
                           transition-colors mt-0.5"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2">
              {SAFETY_NOTICES.map((notice, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#EF4444' }}
                  />
                  <p className="text-xs text-red-800 leading-relaxed">
                    {notice}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Countdown timer ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: timerStyle.bg,
          border: `1px solid ${timerStyle.border}`,
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center
                         justify-center shrink-0"
              style={{
                background: timerStyle.badge,
                border: `1px solid ${timerStyle.badgeBorder}`,
              }}
            >
              {isExpired ? (
                <svg width="16" height="16" fill="none" stroke={timerStyle.accent}
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9"  y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke={timerStyle.accent}
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
            </div>
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: timerStyle.text }}
              >
                {isExpired    ? 'Trade Expired'
                 : isCritical ? 'Complete Immediately!'
                 : isUrgent   ? 'Closing Soon'
                 : 'Time Remaining'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isExpired
                  ? 'This trade window has closed'
                  : 'Complete trade within 30 minutes'}
              </p>
            </div>
          </div>

          {/* Clock */}
          <div
            className="font-mono font-black text-2xl tracking-widest
                       px-4 py-2 rounded-xl shrink-0"
            style={{
              background: timerStyle.badge,
              border: `1px solid ${timerStyle.badgeBorder}`,
              color: timerStyle.text,
            }}
          >
            {isExpired ? '00:00' : `${minutes}:${seconds}`}
          </div>
        </div>

        {/* Progress bar */}
        {!isExpired && (
          <div className="h-1.5 w-full bg-black/5">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${timerStyle.accent}, ${timerStyle.accent}cc)`,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Trade summary ── */}
      <div
        className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
      >
        {/* Top bar */}
        <div
          className="h-1"
          style={{ background: 'linear-gradient(90deg, #f97316, #ea580c)' }}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center
                           justify-center text-xl shrink-0"
                style={{
                  background: trade.type === 'btc'
                    ? 'linear-gradient(135deg, #FEF9C3, #FEF08A)'
                    : 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                }}
              >
                {trade.type === 'btc' ? '₿' : '🎁'}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">
                  {trade.type === 'btc'
                    ? `Bitcoin · ${trade.amount} BTC`
                    : `${trade.card_type} · $${trade.amount}`
                  }
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  #{String(id).slice(-6).toUpperCase()}
                  <span className="mx-1.5 font-sans">·</span>
                  {new Date(trade.created_at).toLocaleString('en-GH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <StatusBadge status={trade.status} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Payout',
                value: `GHS ${(trade.amount * trade.rate).toFixed(2)}`,
                highlight: true,
              },
              {
                label: 'Rate',
                value: `GHS ${trade.rate}/$1`,
              },
              ...(trade.txid
                ? [{ label: 'TXID', value: trade.txid, mono: true, full: true }]
                : []),
            ].map(item => (
              <div
                key={item.label}
                className={`rounded-xl px-3 py-3 ${item.full ? 'col-span-2' : ''}`}
                style={{
                  background: item.highlight ? '#fff7ed' : '#fafafa',
                  border: item.highlight ? '1px solid #fed7aa' : '1px solid #f3f4f6',
                }}
              >
                <p className="text-xs text-gray-400 mb-1 font-medium">
                  {item.label}
                </p>
                <p
                  className={`text-sm font-bold
                    ${item.highlight ? 'text-brand-600' : 'text-gray-800'}
                    ${item.mono ? 'font-mono text-xs break-all' : ''}
                  `}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Admin note */}
          {trade.adminNote && (
            <div
              className="mt-3 rounded-xl px-4 py-3 flex items-start gap-2.5"
              style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
            >
              <svg width="14" height="14" fill="none" stroke="#f97316"
                strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-orange-700 mb-0.5">
                  Admin Note
                </p>
                <p className="text-xs text-orange-800 leading-relaxed">
                  {trade.adminNote}
                </p>
              </div>
            </div>
          )}

          {/* Proof image */}
          {trade.image_url && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 mb-2">
                Proof of payment
              </p>
              <img
                src={`https://urbantrustxchange.onrender.com${trade.image_url}`}
                alt="Trade proof"
                className="w-full rounded-xl object-contain max-h-48"
                style={{ border: '1px solid #ffedd5', background: '#fffbf7' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Trade chat ── */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: isExpired ? '1px solid #FECACA' : '1px solid #ffedd5',
          boxShadow: '0 2px 12px rgba(249,115,22,0.08)',
          opacity: isExpired ? 0.8 : 1,
        }}
      >
        {/* Chat header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: '#ffedd5', background: '#fffbf7' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: isExpired ? '#EF4444' : '#22C55E' }}
            />
            <h3 className="text-sm font-bold text-gray-800">Trade Chat</h3>
            {isExpired && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                }}
              >
                Closed
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 font-mono">
            #{id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Messages */}
        <div
          className="h-64 overflow-y-auto px-4 py-3 space-y-3"
          style={{ background: '#fffbf7' }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center
                            h-full gap-2 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center
                           justify-center text-2xl"
                style={{ background: '#ffedd5' }}
              >
                💬
              </div>
              <p className="text-xs font-medium text-gray-500">
                No messages yet
              </p>
              <p className="text-xs text-gray-400">
                The admin will respond shortly.
              </p>
            </div>
          ) : (
            messages.map(m => {
              const isMe =
                m.sender_id?._id === user?.id ||
                m.sender_role === user?.role;
              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-xs text-gray-400 mb-1 px-1">
                    {isMe ? 'You' : '⚡ Admin'}
                  </span>
                  <div
                    className="max-w-[75%] px-3 py-2.5 rounded-xl
                               text-sm leading-relaxed"
                    style={isMe ? {
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    } : {
                      background: 'white',
                      border: '1px solid #ffedd5',
                      color: '#111827',
                      borderBottomLeftRadius: '4px',
                      boxShadow: '0 1px 4px rgba(249,115,22,0.08)',
                    }}
                  >
                    {m.message && <p>{m.message}</p>}
                    {m.image_url && (
                      <img
                        src={`https://urbantrustxchange.onrender.com${m.image_url}`}
                        alt="attachment"
                        className="mt-1.5 rounded-lg max-w-full"
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input or expired message */}
        {isExpired ? (
          <div
            className="px-4 py-3 text-center border-t"
            style={{ background: '#FEF2F2', borderColor: '#FECACA' }}
          >
            <p className="text-sm font-semibold text-red-600">
              ⛔ This trade has expired
            </p>
            <p className="text-xs text-red-400 mt-0.5">
              Chat is now closed for this trade
            </p>
          </div>
        ) : (
          <div
            className="border-t px-3 py-2.5"
            style={{ borderColor: '#ffedd5' }}
          >
            {/* Image preview */}
            {image && (
              <div
                className="flex items-center gap-2 mb-2 rounded-lg px-3 py-1.5"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
              >
                <svg width="12" height="12" fill="none" stroke="#f97316"
                  strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs text-brand-600 font-medium truncate flex-1">
                  {image.name}
                </span>
                <button
                  onClick={() => setImage(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Image attach */}
              <label
                className="cursor-pointer text-gray-400
                           hover:text-brand-500 transition-colors shrink-0"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setImage(e.target.files[0])}
                />
                <svg width="18" height="18" fill="none" stroke="currentColor"
                  strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </label>

              {/* Text input */}
              <input
                className="flex-1 text-sm rounded-xl px-3 py-2
                           focus:outline-none focus:ring-2
                           focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 placeholder:text-gray-400"
                style={{
                  border: '1px solid #ffedd5',
                  background: '#fffbf7',
                }}
                placeholder="Type a message…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />

              {/* Send button */}
              <button
                onClick={send}
                disabled={sending || (!text.trim() && !image)}
                className="shrink-0 text-white px-3 py-2 rounded-xl
                           text-sm font-medium transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed
                           active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                }}
              >
                {sending ? (
                  <svg className="animate-spin w-4 h-4" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dispute section ── */}
      <div
        ref={disputeRef}
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: '1px solid #ffedd5',
          boxShadow: '0 2px 12px rgba(249,115,22,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: '#ffedd5', background: '#fffbf7' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center
                         justify-center shrink-0"
              style={{ background: '#ffedd5', border: '1px solid #fed7aa' }}
            >
              <svg width="15" height="15" fill="none" stroke="#f97316"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Open a Dispute
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Issue with this trade? Let us know
              </p>
            </div>
          </div>

          {!disputeSubmitted && (
            <button
              onClick={() => {
                setDisputeOpen(o => !o);
                setDisputeError('');
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg
                         transition-all duration-200 active:scale-[0.97]"
              style={disputeOpen ? {
                background: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
              } : {
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                border: '1px solid transparent',
                boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
              }}
            >
              {disputeOpen ? 'Cancel' : 'Open Dispute'}
            </button>
          )}
        </div>

        {/* Success state */}
        {disputeSubmitted && (
          <div className="px-5 py-6 flex flex-col items-center text-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#DCFCE7', border: '1px solid #BBF7D0' }}
            >
              <svg width="24" height="24" fill="none" stroke="#16A34A"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">
                Dispute Submitted
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                Our team will review your case within 24 hours.
                Admin decisions are final.
              </p>
            </div>
            <div
              className="w-full rounded-xl px-4 py-3 text-left"
              style={{ background: '#f0fdf4', border: '1px solid #BBF7D0' }}
            >
              <p className="text-xs font-semibold text-green-700 mb-1">
                Your submission
              </p>
              <p className="text-xs text-green-800 leading-relaxed">
                {disputeText}
              </p>
            </div>
          </div>
        )}

        {/* Dispute form */}
        {disputeOpen && !disputeSubmitted && (
          <div className="px-5 py-5 space-y-4">

            {/* Info box */}
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
            >
              <svg width="14" height="14" fill="none" stroke="#f97316"
                strokeWidth="2" viewBox="0 0 24 24"
                className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-orange-800 leading-relaxed">
                Provide full details of your issue. Disputes are reviewed
                within 24 hours and admin decisions are final.
              </p>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Describe your issue{' '}
                <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                value={disputeText}
                onChange={e => {
                  setDisputeText(e.target.value);
                  setDisputeError('');
                }}
                placeholder="Describe your issue in detail. Include what went wrong, relevant amounts, and the outcome you expect…"
                className="w-full text-sm rounded-xl px-3 py-2.5 resize-none
                           focus:outline-none focus:ring-2 focus:border-transparent
                           transition-all duration-200 placeholder:text-gray-400
                           leading-relaxed"
                style={{
                  border: disputeError
                    ? '1px solid #FECACA'
                    : '1px solid #fed7aa',
                  background: '#fffbf7',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.25)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              <div className="flex items-center justify-between mt-1.5">
                {disputeError ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg width="11" height="11" fill="none" stroke="currentColor"
                      strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8"  x2="12"    y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {disputeError}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Minimum 20 characters
                  </p>
                )}
                <p
                  className="text-xs font-medium tabular-nums"
                  style={{
                    color: disputeText.length < 20 ? '#9ca3af' : '#16A34A',
                  }}
                >
                  {disputeText.length} / 20+
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleDisputeSubmit}
              disabled={!disputeText.trim() || disputeLoading}
              className="w-full flex items-center justify-center gap-2
                         text-white text-sm font-bold py-3 rounded-xl
                         transition-all duration-200 active:scale-[0.98]
                         disabled:cursor-not-allowed"
              style={{
                background: !disputeText.trim() || disputeLoading
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: !disputeText.trim() || disputeLoading
                  ? '#9ca3af'
                  : 'white',
                boxShadow: disputeText.trim() && !disputeLoading
                  ? '0 4px 14px rgba(249,115,22,0.30)'
                  : 'none',
              }}
            >
              {disputeLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Dispute
                </>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

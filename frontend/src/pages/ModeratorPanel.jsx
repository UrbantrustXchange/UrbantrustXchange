import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

function StatCard({ label, value, icon, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 px-4 py-4"
      style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: bg }}>{icon}</div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ChatPanel({ trade, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [image,    setImage]    = useState(null);
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(() =>
    axios.get(`https://urbantrustxchange.onrender.com/api/chat/${trade._id}`)
      .then(r => setMessages(r.data))
      .catch(() => {}), [trade._id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() && !image) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append('message', text.trim());
      if (image) fd.append('image', image);
      await axios.post(`https://urbantrustxchange.onrender.com/api/chat/${trade._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setText('');
      setImage(null);
      fetchMessages();
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl overflow-hidden animate-slide-up"
        style={{
          boxShadow: '0 24px 48px rgba(0,0,0,0.20)',
          maxHeight: '90vh',
          borderRadius: '20px 20px 0 0',
        }}>

        {/* Header */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg,#f97316,#ea580c)' }} />
        <div className="flex items-center gap-3 px-5 py-4 border-b border-orange-50"
          style={{ background: '#fffbf7' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: trade.type === 'btc' ? 'linear-gradient(135deg,#FEF9C3,#FEF08A)' : 'linear-gradient(135deg,#ffedd5,#fed7aa)' }}>
            {trade.type === 'btc' ? '₿' : '🎁'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {trade.type === 'btc' ? `Bitcoin · ${trade.amount} BTC` : `${trade.card_type} · $${trade.amount}`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              #{String(trade._id).slice(-6).toUpperCase()}
              <span className="mx-1">·</span>
              {trade.user_id?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={trade.status} />
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Trade image */}
        {trade.image_url && (
          <div className="px-5 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Proof</p>
            <img src={`https://urbantrustxchange.onrender.com${trade.image_url}`}
              alt="proof" className="w-full rounded-xl object-contain max-h-40 border border-orange-100" />
          </div>
        )}

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 mt-3"
          style={{ background: '#fffbf7' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: '#ffedd5' }}>💬</div>
              <p className="text-xs text-gray-400">No messages yet. Start the conversation.</p>
            </div>
          ) : messages.map(m => {
            const isStaff = ['admin', 'moderator'].includes(m.sender_role);
            return (
              <div key={m._id} className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {isStaff ? '⚡ Support' : '👤 User'}
                </span>
                <div className="max-w-[78%] px-3 py-2.5 rounded-xl text-sm leading-relaxed"
                  style={isStaff ? {
                    background: 'linear-gradient(135deg,#f97316,#ea580c)',
                    color: 'white',
                    borderBottomRightRadius: '4px',
                  } : {
                    background: 'white',
                    border: '1px solid #ffedd5',
                    color: '#111827',
                    borderBottomLeftRadius: '4px',
                    boxShadow: '0 1px 4px rgba(249,115,22,0.08)',
                  }}>
                  {m.message && <p>{m.message}</p>}
                  {m.image_url && (
                    <img src={`https://urbantrustxchange.onrender.com${m.image_url}`}
                      alt="attachment" className="mt-1.5 rounded-lg max-w-full" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t px-3 py-3" style={{ borderColor: '#ffedd5', background: 'white' }}>
          {image && (
            <div className="flex items-center gap-2 mb-2 rounded-lg px-3 py-1.5"
              style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <span className="text-xs text-brand-600 font-medium truncate flex-1">{image.name}</span>
              <button onClick={() => setImage(null)} className="text-gray-400 hover:text-red-500">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer text-gray-400 hover:text-brand-500 transition-colors shrink-0">
              <input type="file" accept="image/*" className="hidden"
                onChange={e => setImage(e.target.files[0])} />
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </label>
            <input
              className="flex-1 text-sm rounded-xl px-3 py-2.5 focus:outline-none transition-all placeholder:text-gray-400"
              style={{ border: '1px solid #ffedd5', background: '#fffbf7' }}
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button onClick={send} disabled={sending || (!text.trim() && !image)}
              className="shrink-0 text-white px-3 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              {sending ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModeratorPanel() {
  const navigate = useNavigate();
  const [trades,      setTrades]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all');
  const [activeChat,  setActiveChat]  = useState(null);

  const fetchTrades = useCallback(() =>
    axios.get('https://urbantrustxchange.onrender.com/api/admin/trades')
      .then(r => setTrades(r.data))
      .catch(() => {}), []);

  useEffect(() => {
    fetchTrades().finally(() => setLoading(false));
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, [fetchTrades]);

  const filtered = trades.filter(t => {
    const matchSearch = !search.trim() ||
      t.user_id?.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.card_type?.toLowerCase().includes(search.toLowerCase()) ||
      t.type?.toLowerCase().includes(search.toLowerCase()) ||
      String(t._id).toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total:     trades.length,
    pending:   trades.filter(t => t.status === 'pending').length,
    reviewing: trades.filter(t => t.status === 'reviewing').length,
    disputes:  trades.filter(t => t.dispute?.opened).length,
  };

  const statCards = [
    { label: 'Total Trades',   value: stats.total,     icon: '📋', bg: '#ffedd5', color: 'text-gray-900'   },
    { label: 'Pending',        value: stats.pending,   icon: '⏳', bg: '#FEF9C3', color: 'text-amber-600'  },
    { label: 'Under Review',   value: stats.reviewing, icon: '🔍', bg: '#DBEAFE', color: 'text-blue-600'   },
    { label: 'Open Disputes',  value: stats.disputes,  icon: '⚠️', bg: '#FEE2E2', color: 'text-red-600'    },
  ];

  const FILTERS = ['all', 'pending', 'reviewing', 'paid', 'rejected'];

  if (loading) return (
    <div className="animate-fade-in space-y-4">
      <div className="h-7 w-40 bg-orange-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-100 px-4 py-4 space-y-2">
            <div className="h-3 w-20 bg-orange-100 rounded animate-pulse" />
            <div className="h-7 w-12 bg-orange-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">

      {activeChat && (
        <ChatPanel trade={activeChat} onClose={() => setActiveChat(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Moderator Panel</h1>
          <p className="text-xs text-gray-400 mt-0.5">Review trades and support users</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border"
          style={{ background: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' }}>
          🛡️ Moderator
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by email, type, trade ID…"
          className="w-full border border-orange-200 rounded-xl pl-9 pr-3 py-2.5 text-sm
                     bg-orange-50 focus:outline-none focus:ring-2 focus:ring-brand-500
                     focus:border-transparent focus:bg-white transition-all placeholder:text-gray-400" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all capitalize
              ${filter === f
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            style={filter === f ? {
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
            } : {
              background: '#fff7ed',
              border: '1px solid #ffedd5',
            }}>
            {f === 'all' ? `All (${trades.length})` : f}
          </button>
        ))}
      </div>

      {/* Trades list */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No trades found.</p>
          </div>
        ) : filtered.map((t, i) => (
          <div key={t._id}
            className={`px-4 py-4 hover:bg-orange-50 transition-colors
              ${i !== filtered.length - 1 ? 'border-b border-orange-50' : ''}`}>

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: t.type === 'btc' ? 'linear-gradient(135deg,#FEF9C3,#FEF08A)' : 'linear-gradient(135deg,#ffedd5,#fed7aa)' }}>
                  {t.type === 'btc' ? '₿' : '🎁'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {t.user_id?.email || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.type === 'btc' ? `Bitcoin · ${t.amount} BTC` : `${t.card_type} · $${t.amount}`}
                    <span className="mx-1">·</span>
                    <span className="font-semibold text-gray-600">GHS {(t.amount * t.rate).toFixed(2)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {t.dispute?.opened && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
                    ⚠️ Dispute
                  </span>
                )}
                <StatusBadge status={t.status} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-mono">
                #{String(t._id).slice(-6).toUpperCase()}
                <span className="mx-1 font-sans">·</span>
                {new Date(t.created_at).toLocaleDateString('en-GH', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
              <button
                onClick={() => setActiveChat(t)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg,#f97316,#ea580c)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Showing {filtered.length} of {trades.length} trades
        </p>
      )}
    </div>
  );
}

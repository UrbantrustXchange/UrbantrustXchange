import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function AdminChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trade,    setTrade]    = useState(null);
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [image,    setImage]    = useState(null);
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = () =>
    axios.get(`https://urbantrustxchange.onrender.com/api/chat/${id}`)
      .then(r => setMessages(r.data))
      .catch(() => {});

  useEffect(() => {
    axios.get(`https://urbantrustxchange.onrender.com/api/admin/trades/${id}`)
      .then(r => setTrade(r.data))
      .catch(() => {});
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

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
      await axios.post(`https://urbantrustxchange.onrender.com/api/chat/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setText('');
      setImage(null);
      fetchMessages();
    } catch {}
    finally { setSending(false); }
  };

  if (!trade) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-6 h-6 rounded-full border-2 border-orange-200 border-t-orange-500" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6 animate-fade-in">

      {/* Back */}
      <button onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 mb-4 transition-colors">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Admin
      </button>

      {/* Trade summary */}
      <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4"
        style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: trade.type === 'btc' ? 'linear-gradient(135deg,#FEF9C3,#FEF08A)' : 'linear-gradient(135deg,#ffedd5,#fed7aa)' }}>
              {trade.type === 'btc' ? '₿' : '🎁'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {trade.type === 'btc' ? `Bitcoin · ${trade.amount} BTC` : `${trade.card_type} · $${trade.amount}`}
              </p>
              <p className="text-xs text-gray-400 font-mono">#{String(id).slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <StatusBadge status={trade.status} />
        </div>

        {/* Trade image proof */}
        {trade.image_url && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">Payment proof</p>
            <img
              src={`https://urbantrustxchange.onrender.com${trade.image_url}`}
              alt="Trade proof"
              className="w-full rounded-xl object-contain max-h-48 border border-orange-100"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-50">
          <p className="text-xs text-gray-500">
            Payout: <span className="font-bold text-gray-800">GHS {(trade.amount * trade.rate).toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-400">
            {new Date(trade.created_at).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Chat box */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-orange-50"
          style={{ background: '#fffbf7' }}>
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-sm font-bold text-gray-800">Chat with User</p>
          <span className="ml-auto text-xs text-gray-400 font-mono">
            {trade.user_id?.email || ''}
          </span>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto px-4 py-3 space-y-3"
          style={{ background: '#fffbf7' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: '#ffedd5' }}>💬</div>
              <p className="text-xs text-gray-400">No messages yet. Send the first message.</p>
            </div>
          ) : (
            messages.map(m => {
              const isAdmin = m.sender_role === 'admin';
              return (
                <div key={m._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-400 mb-1 px-1">
                    {isAdmin ? '⚡ You (Admin)' : '👤 User'}
                  </span>
                  <div className="max-w-[75%] px-3 py-2.5 rounded-xl text-sm leading-relaxed"
                    style={isAdmin ? {
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    } : {
                      background: 'white',
                      border: '1px solid #ffedd5',
                      color: '#111827',
                      borderBottomLeftRadius: '4px',
                    }}>
                    {m.message && <p>{m.message}</p>}
                    {m.image_url && (
                      <img src={`https://urbantrustxchange.onrender.com${m.image_url}`}
                        alt="attachment" className="mt-1.5 rounded-lg max-w-full" />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t px-3 py-2.5" style={{ borderColor: '#ffedd5' }}>
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
              className="flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none transition-all placeholder:text-gray-400"
              style={{ border: '1px solid #ffedd5', background: '#fffbf7' }}
              placeholder="Type a message to the user…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button onClick={send} disabled={sending || (!text.trim() && !image)}
              className="shrink-0 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
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

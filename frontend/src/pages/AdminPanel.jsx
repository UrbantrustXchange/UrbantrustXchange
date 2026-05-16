// frontend/src/pages/AdminPanel.jsx

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
const STATUSES = ['pending', 'reviewing', 'paid', 'rejected'];

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg }) {
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

// ── Confirm modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ trade, newStatus, note, onNoteChange, onConfirm, onCancel, loading }) {
  const statusColors = {
    paid:      { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
    rejected:  { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
    reviewing: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    pending:   { bg: '#FEF9C3', text: '#854D0E', border: '#FEF08A' },
  };
  const c = statusColors[newStatus] || statusColors.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-orange-100
                      w-full max-w-sm p-6 space-y-4 animate-slide-up">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            {newStatus === 'paid' ? '✅' : newStatus === 'rejected' ? '❌' : newStatus === 'reviewing' ? '🔍' : '⏳'}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Update trade status</h3>
            <p className="text-xs text-gray-400 mt-0.5">User will be notified by email</p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 text-sm space-y-1.5"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <div className="flex justify-between">
            <span style={{ color: c.text }} className="text-xs font-medium">Trade ID</span>
            <span style={{ color: c.text }} className="text-xs font-mono">#{String(trade._id).slice(-6).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: c.text }} className="text-xs font-medium">User</span>
            <span style={{ color: c.text }} className="text-xs truncate max-w-[160px]">{trade.user_id?.email}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: c.text }} className="text-xs font-medium">New status</span>
            <span style={{ color: c.text }} className="text-xs font-bold capitalize">{newStatus}</span>
          </div>
        </div>

        {/* Admin note */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Admin note (optional — shown to user)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="e.g. Card was invalid, please resubmit…"
            className="w-full text-sm rounded-xl px-3 py-2 resize-none
                       focus:outline-none transition-all placeholder:text-gray-400"
            style={{ border: '1px solid #fed7aa', background: '#fffbf7' }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 text-sm
                       font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 text-white text-sm font-semibold py-2.5 rounded-xl
                       transition disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab,          setTab]          = useState('trades');
  const [trades,       setTrades]       = useState([]);
  const [cards,        setCards]        = useState([]);
  const [users,        setUsers]        = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [btcRate,      setBtcRate]      = useState('');
  const [btcSaving,    setBtcSaving]    = useState(false);
  const [btcMsg,       setBtcMsg]       = useState('');
  const navigate = useNavigate();
  // Confirm modal state
  const [confirm, setConfirm] = useState(null); // { trade, newStatus }
  const [adminNote, setAdminNote] = useState('');

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchTrades = useCallback(() =>
    axios.get('/api/admin/trades').then(r => setTrades(r.data)).catch(() => {}), []);

  const fetchCards = useCallback(() =>
    axios.get('/api/cards/all').then(r => setCards(r.data)).catch(() => {}), []);

  const fetchStats = useCallback(() =>
    axios.get('/api/admin/stats').then(r => setStats(r.data)).catch(() => {}), []);

  const fetchUsers = useCallback(() =>
    axios.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => {}), []);

  const fetchBtcRate = useCallback(() =>
    axios.get('/api/admin/btc-rate').then(r => setBtcRate(String(r.data.rate))).catch(() => {}), []);

  useEffect(() => {
    Promise.all([fetchTrades(), fetchCards(), fetchStats(), fetchUsers(), fetchBtcRate()])
      .finally(() => setLoading(false));
  }, [fetchTrades, fetchCards, fetchStats, fetchUsers, fetchBtcRate]);

  // ── Status update ────────────────────────────────────────────────────────────
  const confirmStatusUpdate = async () => {
    if (!confirm) return;
    setUpdating(true);
    try {
      await axios.patch(`/api/admin/trades/${confirm.trade._id}/status`, {
        status: confirm.newStatus,
        adminNote: adminNote.trim() || undefined,
      });
      await Promise.all([fetchTrades(), fetchStats()]);
    } catch (err) {
      console.error('[AdminPanel] status update failed:', err.message);
    } finally {
      setUpdating(false);
      setConfirm(null);
      setAdminNote('');
    }
  };

  // ── Card update ──────────────────────────────────────────────────────────────
  const updateCard = async (id, field, value) => {
    const card = cards.find(c => c._id === id);
    if (!card) return;
    try {
      await axios.put(`/api/cards/${id}`, { ...card, [field]: value });
      fetchCards();
    } catch (err) {
      console.error('[AdminPanel] card update failed:', err.message);
    }
  };

  // ── BTC rate update ──────────────────────────────────────────────────────────
  const saveBtcRate = async () => {
    const rate = parseInt(btcRate, 10);
    if (!rate || rate <= 0) return setBtcMsg('Enter a valid rate.');
    setBtcSaving(true);
    try {
      await axios.patch('/api/admin/btc-rate', { rate });
      setBtcMsg(`✅ Rate updated to GHS ${rate.toLocaleString()}`);
    } catch (err) {
      setBtcMsg('❌ Failed to update rate.');
    } finally {
      setBtcSaving(false);
      setTimeout(() => setBtcMsg(''), 3000);
    }
  };

  // ── Verify user toggle ───────────────────────────────────────────────────────
 const changeRole = async (userId, role) => {
  try {
    await axios.patch(`/api/admin/users/${userId}/role`, { role });
    fetchUsers();
  } catch (err) {
    console.error('[AdminPanel] role change failed:', err.message);
  }
};
  const toggleVerify = async (userId, currentState) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/verify`, { isVerified: !currentState });
      fetchUsers();
    } catch (err) {
      console.error('[AdminPanel] verify toggle failed:', err.message);
    }
  };

  // ── Filtered trades ──────────────────────────────────────────────────────────
  const filteredTrades = trades.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.user_id?.email?.toLowerCase().includes(q) ||
      t.type?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q) ||
      t.card_type?.toLowerCase().includes(q) ||
      String(t._id).toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: 'Total Trades',     value: stats?.totalTrades    ?? trades.length, icon: '📊', color: 'text-gray-900', bg: '#ffedd5' },
    { label: 'Pending Review',   value: stats?.pendingTrades  ?? 0,             icon: '⏳', color: 'text-amber-600', bg: '#FEF9C3' },
    { label: 'Paid (GHS)',       value: `${(stats?.totalPaidGHS ?? 0).toLocaleString()}`, icon: '💰', color: 'text-brand-600', bg: '#DCFCE7' },
    { label: 'Total Users',      value: stats?.totalUsers     ?? users.length,  icon: '👥', color: 'text-blue-600', bg: '#DBEAFE' },
    { label: 'Open Disputes',    value: stats?.openDisputes   ?? 0,             icon: '⚠️', color: 'text-red-600', bg: '#FEE2E2' },
    { label: 'Under Review',     value: stats?.reviewingTrades ?? 0,            icon: '🔍', color: 'text-indigo-600', bg: '#EDE9FE' },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="h-7 w-32 bg-orange-100 rounded-lg animate-pulse" />
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
  }

  return (
    <div className="animate-fade-in">

      {confirm && (
        <ConfirmModal
          trade={confirm.trade}
          newStatus={confirm.newStatus}
          note={adminNote}
          onNoteChange={setAdminNote}
          onConfirm={confirmStatusUpdate}
          onCancel={() => { setConfirm(null); setAdminNote(''); }}
          loading={updating}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage trades, cards, users & settings</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border"
          style={{ background: '#ffedd5', color: '#c2410c', borderColor: '#fed7aa' }}>
          ⚡ Admin
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl p-1 mb-5"
        style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}>
        {[
          { key: 'trades', label: 'Trades',      icon: '📋' },
          { key: 'cards',  label: 'Gift Cards',  icon: '🎁' },
          { key: 'users',  label: 'Users',       icon: '👥' },
          { key: 'btc',    label: 'BTC Rate',    icon: '₿' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg
                        text-xs font-semibold transition-all duration-200
                        ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            style={tab === t.key ? { boxShadow: '0 1px 4px rgba(249,115,22,0.12)' } : {}}>
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ TRADES TAB ══════════════ */}
      {tab === 'trades' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by email, type, status, ID…"
              className="w-full border border-orange-200 rounded-xl pl-9 pr-3 py-2.5 text-sm
                         bg-orange-50 focus:outline-none focus:ring-2 focus:ring-brand-500
                         focus:border-transparent focus:bg-white transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }}>
            {filteredTrades.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'No trades match your search.' : 'No trades yet.'}
                </p>
              </div>
            ) : (
              filteredTrades.map((t, i) => (
                <div key={t._id}
                  className={`px-4 py-4 transition-colors hover:bg-orange-50
                    ${i !== filteredTrades.length - 1 ? 'border-b border-orange-50' : ''}`}>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ background: t.type === 'btc' ? 'linear-gradient(135deg,#FEF9C3,#FEF08A)' : 'linear-gradient(135deg,#ffedd5,#fed7aa)' }}>
                        {t.type === 'btc' ? '₿' : '🎁'}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {t.user_id?.email || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.dispute?.opened && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
                          ⚠️ Dispute
                        </span>
                      )}
                      <StatusBadge status={t.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        {t.type === 'btc' ? `Bitcoin · ${t.amount} BTC` : `${t.card_type} · $${t.amount}`}
                        <span className="mx-1.5 text-orange-300">→</span>
                        <span className="font-semibold text-gray-700">
                          GHS {(t.amount * t.rate).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        #{String(t._id).slice(-6).toUpperCase()}
                        <span className="mx-1">·</span>
                        {new Date(t.created_at).toLocaleDateString('en-GH', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                        {t.dispute?.opened && (
                          <span className="ml-2 text-red-400">
                            · Dispute: {t.dispute.reason?.slice(0, 40)}…
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                   onClick={() => navigate(`/admin/chat/${t._id}`)}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border"
                    style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
                     >
                    View
                    </button>
                    <select
                      value={t.status}
                      onChange={e => {
                        setConfirm({ trade: t, newStatus: e.target.value });
                        setAdminNote('');
                      }}
                      className="text-xs border border-orange-200 rounded-lg
                                 px-2 py-1.5 bg-orange-50 text-gray-700
                                 focus:outline-none focus:ring-2 focus:ring-brand-500
                                 cursor-pointer shrink-0"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {t.adminNote && (
                    <div className="mt-2 rounded-lg px-3 py-2"
                      style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}>
                      <p className="text-xs text-orange-700">
                        <span className="font-semibold">Admin note:</span> {t.adminNote}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {filteredTrades.length > 0 && (
            <p className="text-xs text-gray-400 text-center">
              Showing {filteredTrades.length} of {trades.length} trades
            </p>
          )}
        </div>
      )}

      {/* ══════════════ CARDS TAB ══════════════ */}
      {tab === 'cards' && (
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }}>
          <div className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold text-gray-400
                          uppercase tracking-wider"
            style={{ background: '#fffbf7', borderBottom: '1px solid #ffedd5' }}>
            <span className="col-span-1">Card</span>
            <span className="text-center">Rate (GHS/$)</span>
            <span className="text-center">Risk</span>
            <span className="text-right">Status</span>
          </div>
          {cards.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No gift cards found.</p>
          )}
          {cards.map((c, i) => (
            <div key={c._id}
              className={`px-4 py-3.5 flex items-center gap-3 hover:bg-orange-50
                transition-colors ${i !== cards.length - 1 ? 'border-b border-orange-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-gray-400">GHS</span>
                <input
                  type="number" step="0.1" min="0"
                  defaultValue={c.rate}
                  onBlur={e => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val !== c.rate) updateCard(c._id, 'rate', val);
                  }}
                  className="w-16 text-sm border border-orange-200 rounded-lg
                             px-2 py-1 text-center bg-orange-50
                             focus:outline-none focus:ring-2 focus:ring-brand-500
                             focus:bg-white transition"
                />
                <span className="text-xs text-gray-400">/$</span>
              </div>
              <select value={c.risk_level}
                onChange={e => updateCard(c._id, 'risk_level', e.target.value)}
                className="text-xs border border-orange-200 rounded-lg px-2 py-1.5
                           bg-orange-50 text-gray-700 focus:outline-none
                           focus:ring-1 focus:ring-brand-500 shrink-0">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={() => updateCard(c._id, 'enabled', !c.enabled)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold
                  transition-all duration-200 border
                  ${c.enabled
                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200'
                  }`}>
                {c.enabled ? '● ON' : '○ OFF'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ USERS TAB ══════════════ */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }}>
          <div className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider"
            style={{ background: '#fffbf7', borderBottom: '1px solid #ffedd5' }}>
            <span className="col-span-2">User</span>
            <span className="text-center">Traded</span>
            <span className="text-right">KYC</span>
          </div>
          {users.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No users found.</p>
          )}
          {users.map((u, i) => (
            <div key={u._id}
              className={`px-4 py-3.5 flex items-center gap-3 hover:bg-orange-50
                transition-colors ${i !== users.length - 1 ? 'border-b border-orange-50' : ''}`}>
              {/* Avatar + email */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                  {u.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {u.phoneNumber}
                    {u.role === 'admin' && (
                      <span className="ml-1 text-brand-500 font-bold">· Admin</span>
                    )}
                  </p>
                </div>
              </div>
              {/* Traded */}
              <div className="text-center shrink-0">
                <p className="text-xs font-bold text-gray-700">${u.totalTradedUSD?.toFixed(2) || '0.00'}</p>
              </div>
              {/* KYC toggle */}
              <select
               value={u.role}
               onChange={e => changeRole(u._id, e.target.value)}
               className="text-xs border border-orange-200 rounded-lg px-2 py-1.5
             bg-orange-50 text-gray-700 focus:outline-none
             focus:ring-1 focus:ring-brand-500 shrink-0 mr-1">
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
             </select>
              <button
                onClick={() => toggleVerify(u._id, u.isVerified)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold
                  transition-all border
                  ${u.isVerified
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200'
                  }`}>
                {u.isVerified ? '✅ KYC' : '⏳ Verify'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ BTC RATE TAB ══════════════ */}
      {tab === 'btc' && (
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.07)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#f97316,#ea580c)' }} />
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg,#FEF9C3,#FEF08A)', border: '1px solid #FDE047' }}>₿</div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">BTC / GHS Exchange Rate</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  This rate is shown to users when selling Bitcoin
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Rate (GHS per 1 BTC)
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">GHS</span>
                  <input
                    type="number"
                    value={btcRate}
                    onChange={e => setBtcRate(e.target.value)}
                    className="w-full border border-orange-200 rounded-xl pl-12 pr-3 py-2.5
                               text-sm bg-orange-50 text-gray-900 font-mono
                               focus:outline-none focus:ring-2 focus:ring-brand-500
                               focus:border-transparent focus:bg-white transition-all"
                    placeholder="e.g. 446250"
                  />
                </div>
                <button
                  onClick={saveBtcRate}
                  disabled={btcSaving}
                  className="px-5 py-2.5 text-sm font-bold text-white rounded-xl
                             transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                  {btcSaving ? 'Saving…' : 'Update'}
                </button>
              </div>
              {btcMsg && (
                <p className="mt-2 text-xs font-medium" style={{ color: btcMsg.startsWith('✅') ? '#16A34A' : '#DC2626' }}>
                  {btcMsg}
                </p>
              )}
            </div>

            <div className="rounded-xl px-4 py-3" style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}>
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Note:</strong> This rate is stored in memory and resets when the server restarts.
                To persist it, update <code className="bg-orange-100 px-1 rounded">BTC_RATE_GHS</code> in your <code className="bg-orange-100 px-1 rounded">.env</code> file.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

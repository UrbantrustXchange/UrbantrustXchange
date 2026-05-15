// frontend/src/pages/SellBTC.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DEFAULT_RATE   = 446250;
const BTC_WALLET     = 'bc1qxy2kgdygjrsqtzq2n0yrf249v3tgqhk3p2zsg';

const BTC_RULES = [
  'Send the exact BTC amount shown — no more, no less',
  'Paste your correct TXID after sending',
  'Upload a clear screenshot of your transaction as proof',
  'Trades must be completed within 30 minutes',
];

export default function SellBTC() {
  const navigate = useNavigate();
  const [btcRate, setBtcRate] = useState(DEFAULT_RATE);
  const [amount,  setAmount]  = useState('');
  const [txid,    setTxid]    = useState('');
  const [image,   setImage]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [copied,  setCopied]  = useState(false);
  const [agreed,  setAgreed]  = useState(false);

  // Fetch live BTC rate from admin endpoint
  useEffect(() => {
    axios.get('/api/admin/btc-rate')
      .then(r => { if (r.data?.rate) setBtcRate(r.data.rate); })
      .catch(() => {}); // silently use default
  }, []);

  const payout = amount ? (parseFloat(amount) * btcRate).toFixed(2) : null;

  const copyWallet = () => {
    navigator.clipboard.writeText(BTC_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!amount || !txid || !image) return setError('Please fill all fields and upload proof.');
    if (!agreed) return setError('You must agree to the trade rules before proceeding.');
    if (parseFloat(amount) <= 0) return setError('Enter a valid BTC amount.');
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type',   'btc');
      fd.append('amount', amount);
      fd.append('rate',   btcRate);
      fd.append('txid',   txid.trim());
      fd.append('image',  image);
      await axios.post('/api/trades', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sell Bitcoin</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Send BTC and receive GHS via mobile money
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-2.5 text-sm text-red-700
                        bg-red-50 border border-red-200 rounded-xl
                        px-4 py-3 mb-5 animate-slide-up">
          <svg width="15" height="15" fill="none" stroke="currentColor"
            strokeWidth="2.5" viewBox="0 0 24 24"
            className="shrink-0 mt-0.5 text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"    y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Main form card ── */}
        <div
          className="bg-white rounded-2xl border border-orange-100 p-5 space-y-5"
          style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.08)' }}
        >
          {/* Orange top bar */}
          <div
            className="h-1 rounded-full -mt-5 -mx-5 mb-1"
            style={{ background: 'linear-gradient(90deg, #f97316, #ea580c)' }}
          />

          {/* BTC rate display */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #FEF9C3, #FEF08A)', border: '1px solid #FDE047' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">₿</span>
              <div>
                <p className="text-xs text-yellow-700 font-medium">Today's BTC Rate</p>
                <p className="text-xs text-yellow-600">Set by admin</p>
              </div>
            </div>
            <p className="text-base font-bold text-yellow-800">
              GHS {btcRate.toLocaleString()}
              <span className="text-xs font-normal text-yellow-600 ml-1">/ BTC</span>
            </p>
          </div>

          {/* BTC amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              BTC Amount to Sell
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₿</span>
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-orange-200 rounded-xl
                           pl-7 pr-3 py-2.5 text-sm bg-orange-50 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-brand-500
                           focus:border-transparent focus:bg-white
                           transition-all duration-200 placeholder:text-gray-400"
                placeholder="e.g. 0.005"
              />
            </div>
          </div>

          {/* Payout preview */}
          {payout && (
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between animate-slide-up"
              style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fed7aa' }}
            >
              <div>
                <p className="text-xs text-gray-500 mb-0.5">You receive</p>
                <p className="text-lg font-bold text-brand-600">
                  GHS {parseFloat(payout).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Rate</p>
                <p className="text-sm font-semibold text-gray-700">
                  GHS {btcRate.toLocaleString()} / BTC
                </p>
              </div>
            </div>
          )}

          {/* Wallet address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Send BTC to this wallet
            </label>
            <div
              className="rounded-xl px-3 py-3 flex items-center justify-between gap-2"
              style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
            >
              <code className="text-xs text-gray-700 break-all leading-relaxed">{BTC_WALLET}</code>
              <button
                type="button"
                onClick={copyWallet}
                className="shrink-0 flex items-center gap-1 text-xs font-bold
                           px-2.5 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  background:  copied ? '#DCFCE7' : '#ffedd5',
                  color:       copied ? '#166534' : '#c2410c',
                  border:      copied ? '1px solid #BBF7D0' : '1px solid #fed7aa',
                }}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Send the exact amount, then paste your TXID below
            </p>
          </div>

          {/* TXID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Transaction ID (TXID)
            </label>
            <input
              type="text"
              value={txid}
              onChange={e => setTxid(e.target.value)}
              className="w-full border border-orange-200 rounded-xl
                         px-3 py-2.5 text-sm font-mono bg-orange-50 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-brand-500
                         focus:border-transparent focus:bg-white
                         transition-all duration-200 placeholder:text-gray-400"
              placeholder="Paste your transaction ID here"
            />
          </div>

          {/* Proof upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Upload Payment Proof
            </label>
            <label
              className="flex flex-col items-center justify-center rounded-xl p-6
                         cursor-pointer text-center transition-all duration-200"
              style={{
                border:     image ? '2px solid #f97316' : '2px dashed #fed7aa',
                background: image ? '#fff7ed' : '#fffbf7',
              }}
              onMouseEnter={e => { if (!image) e.currentTarget.style.borderColor = '#f97316'; }}
              onMouseLeave={e => { if (!image) e.currentTarget.style.borderColor = '#fed7aa'; }}
            >
              <input type="file" accept="image/*" className="hidden"
                onChange={e => setImage(e.target.files[0])} />
              {image ? (
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: '#ffedd5' }}>
                    <svg width="18" height="18" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-brand-600">{image.name}</p>
                  <p className="text-xs text-gray-400">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: '#ffedd5' }}>
                    <svg width="18" height="18" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Upload transaction screenshot</p>
                  <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* ── BTC rules ── */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#fed7aa' }}>
          <div
            className="flex items-center gap-2.5 px-5 py-4 border-b"
            style={{ background: 'linear-gradient(135deg, #FEF9C3, #FEF08A)', borderColor: '#FDE047' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
              style={{ background: '#FDE047' }}>₿</div>
            <div>
              <h3 className="text-sm font-bold text-yellow-900">Bitcoin Trade Rules</h3>
              <p className="text-xs text-yellow-700 mt-0.5">Please read before submitting</p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3" style={{ background: '#fffbf7' }}>
            {BTC_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >{i + 1}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
                <div className="w-5 h-5 rounded border-2 transition-all flex items-center justify-center"
                  style={{ background: agreed ? '#f97316' : 'white', borderColor: agreed ? '#f97316' : '#fed7aa' }}>
                  {agreed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-orange-900 leading-snug">
                I understand and agree to these rules
              </span>
            </label>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading || !agreed}
          className="w-full flex items-center justify-center gap-2
                     py-3 rounded-xl text-sm font-bold
                     transition-all duration-200 active:scale-[0.98]
                     disabled:cursor-not-allowed"
          style={{
            background: !agreed || loading ? '#e5e7eb' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color:      !agreed || loading ? '#9ca3af' : 'white',
            boxShadow:  agreed && !loading ? '0 4px 14px rgba(249,115,22,0.35)' : 'none',
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Submitting trade…
            </>
          ) : !agreed ? (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 11V7m0 4v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Agree to rules to continue
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Trade
            </>
          )}
        </button>

      </form>
    </div>
  );
}

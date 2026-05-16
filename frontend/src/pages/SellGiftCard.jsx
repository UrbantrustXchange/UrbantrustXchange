// frontend/src/pages/SellGiftCard.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TRADE_RULES = [
  'Only valid, unused gift cards are accepted',
  'Cards must be clearly visible (no blurred images or hidden codes)',
  'Already redeemed or invalid cards will be rejected',
  'Fake submissions may result in account suspension',
];

export default function SellGiftCard() {
  const navigate = useNavigate();
  const [cards,    setCards]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount,   setAmount]   = useState('');
  const [image,    setImage]    = useState(null);
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    axios.get('/api/cards').then(r => setCards(r.data)).catch(() => {});
  }, []);

  const payout = selected && amount
    ? (parseFloat(amount) * selected.rate).toFixed(2)
    : null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selected || !amount || !image)
      return setError('Please fill all fields and upload an image.');
    if (!agreed)
      return setError('You must agree to the gift card trade rules before proceeding.');
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type',      'giftcard');
      fd.append('amount',    amount);
      fd.append('rate',      selected.rate);
      fd.append('card_type', selected.name);
      fd.append('image',     image);
      await axios.post('/api/trades', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sell a Gift Card</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Get paid instantly in GHS via mobile money
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
            style={{
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          {/* Card type select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Select Card Type
            </label>
            <select
              className="w-full border border-orange-200 rounded-xl px-3 py-2.5
                         text-sm bg-orange-50 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-brand-500
                         focus:border-transparent focus:bg-white
                         transition-all duration-200"
              onChange={e => setSelected(cards.find(c => c._id === e.target.value) || null)}
              defaultValue=""
            >
              <option value="" disabled>— Choose a card —</option>
              {cards.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} · GHS {c.rate}/$
                </option>
              ))}
            </select>
            {selected && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`risk-${selected.risk_level}`}>
                  {selected.risk_level} risk
                </span>
                <span className="text-xs text-gray-400">
                  Rate: GHS {selected.rate} per $1
                </span>
              </div>
            )}
          </div>

          {/* Card value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Card Value (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2
                               text-sm font-bold text-gray-400">
                $
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-orange-200 rounded-xl
                           pl-7 pr-3 py-2.5 text-sm bg-orange-50 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-brand-500
                           focus:border-transparent focus:bg-white
                           transition-all duration-200 placeholder:text-gray-400"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          {/* Payout preview */}
          {payout && (
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between
                         animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                border: '1px solid #fed7aa',
              }}
            >
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  Estimated payout
                </p>
                <p className="text-lg font-bold text-brand-600">
                  GHS {parseFloat(payout).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Rate</p>
                <p className="text-sm font-semibold text-gray-700">
                  GHS {selected?.rate} / $1
                </p>
              </div>
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Upload Card Image
            </label>
            <label
              className="flex flex-col items-center justify-center
                         rounded-xl p-6 cursor-pointer text-center
                         transition-all duration-200 group"
              style={{
                border: image
                  ? '2px solid #f97316'
                  : '2px dashed #fed7aa',
                background: image ? '#fff7ed' : '#fffbf7',
              }}
              onMouseEnter={e => {
                if (!image) e.currentTarget.style.borderColor = '#f97316';
              }}
              onMouseLeave={e => {
                if (!image) e.currentTarget.style.borderColor = '#fed7aa';
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setImage(e.target.files[0])}
              />
              {image ? (
                <div className="space-y-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center
                               justify-center mx-auto mb-2"
                    style={{ background: 'linear-gradient(135deg, #ffedd5, #fed7aa)' }}
                  >
                    <svg width="18" height="18" fill="none" stroke="#f97316"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-brand-600">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center
                               justify-center mx-auto mb-2"
                    style={{ background: '#ffedd5' }}
                  >
                    <svg width="18" height="18" fill="none" stroke="#f97316"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4
                           M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Click to upload card image
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* ── Rules confirmation ── */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: '#fed7aa' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2.5 px-5 py-4 border-b"
            style={{
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              borderColor: '#fed7aa',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center
                         justify-center shrink-0"
              style={{ background: '#fed7aa' }}
            >
              <svg width="15" height="15" fill="none" stroke="#c2410c"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0
                     012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0
                     01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-900">
                Gift Card Trade Rules
              </h3>
              <p className="text-xs text-orange-700 mt-0.5">
                Please read carefully before submitting
              </p>
            </div>
          </div>

          {/* Rules list */}
          <div
            className="px-5 py-4 space-y-3"
            style={{ background: '#fffbf7' }}
          >
            {TRADE_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-5 h-5
                             rounded-full text-white text-[10px] font-bold
                             shrink-0 mt-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  }}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          {/* Checkbox */}
          <div
            className="px-5 py-4 border-t"
            style={{
              background: '#fff7ed',
              borderColor: '#fed7aa',
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-5 h-5 rounded border-2 transition-all
                             flex items-center justify-center"
                  style={{
                    background:   agreed ? '#f97316' : 'white',
                    borderColor:  agreed ? '#f97316' : '#fed7aa',
                  }}
                >
                  {agreed && (
                    <svg className="w-3 h-3 text-white" fill="none"
                      stroke="currentColor" strokeWidth="3"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-orange-900
                               leading-snug">
                I understand and agree to these rules
              </span>
            </label>
          </div>
        </div>

        {/* ── Submit button ── */}
        <button
          type="submit"
          disabled={loading || !agreed}
          className="w-full flex items-center justify-center gap-2
                     py-3 rounded-xl text-sm font-bold
                     transition-all duration-200 active:scale-[0.98]
                     disabled:cursor-not-allowed"
          style={{
            background: !agreed || loading
              ? '#e5e7eb'
              : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color:      !agreed || loading ? '#9ca3af' : 'white',
            boxShadow:  agreed && !loading
              ? '0 4px 14px rgba(249,115,22,0.35)'
              : 'none',
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none"
                viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Submitting trade…
            </>
          ) : !agreed ? (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 11V7m0 4v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Agree to rules to continue
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Trade
            </>
          )}
        </button>

      </form>
    </div>
  );
}

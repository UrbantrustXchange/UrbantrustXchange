// frontend/src/pages/ForgotPassword.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handle = async e => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError('Please enter a valid email address.');

    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#fff7ed' }}
    >
      <div className="w-full max-w-md animate-fade-in">

        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center
                         justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              }}
            >
              <svg width="20" height="20" fill="none" stroke="white"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Urbantrust<span className="text-brand-500">Xchange</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Forgot your password?
          </h1>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            No worries — enter your email and we will send you a reset link.
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: '1px solid #ffedd5',
            boxShadow: '0 8px 32px rgba(249,115,22,0.12)',
          }}
        >
          {/* Top bar */}
          <div
            className="h-1"
            style={{
              background: submitted
                ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                : 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          <div className="px-8 py-8">

            {/* ── Success state ── */}
            {submitted ? (
              <div className="flex flex-col items-center text-center
                              space-y-5 animate-slide-up">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center
                             justify-center"
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <svg width="28" height="28" fill="none" stroke="#16A34A"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2
                         2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2
                         2 0 002 2z" />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed
                                max-w-xs mx-auto">
                    If{' '}
                    <strong className="text-gray-700">{email}</strong>
                    {' '}is registered, a password reset link is on its way.
                  </p>
                </div>

                <div
                  className="w-full rounded-xl px-4 py-3 space-y-2 text-left"
                  style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
                >
                  {[
                    'Check your email inbox',
                    'Click the reset link in the email',
                    'Choose a new password',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center
                                   justify-center text-white text-[10px]
                                   font-bold shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, #f97316, #ea580c)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-600 font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400">
                  The link expires in{' '}
                  <strong className="text-gray-600">1 hour</strong>.
                  Check your spam folder if you don't see it.
                </p>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2
                             text-white text-sm font-bold py-3 rounded-xl
                             transition-all active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 14px rgba(249,115,22,0.30)',
                  }}
                >
                  Back to Login
                  <svg width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4
                         M10 17l5-5-5-5M15 12H3" />
                  </svg>
                </Link>
              </div>

            ) : (

              /* ── Form state ── */
              <form onSubmit={handle} noValidate className="space-y-5">

                {/* Error */}
                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-xl
                               px-4 py-3 text-sm animate-slide-up"
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#991B1B',
                    }}
                  >
                    <svg width="15" height="15" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8"  x2="12"    y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>{error}</p>
                  </div>
                )}

                {/* Email input */}
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2
                                     -translate-y-1/2 text-gray-400">
                      <svg width="15" height="15" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9
                                 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2
                                 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@email.com"
                      autoComplete="email"
                      className="w-full rounded-xl pl-9 pr-3 py-2.5
                                 text-sm text-gray-900 transition-all
                                 duration-200 focus:outline-none
                                 focus:bg-white placeholder:text-gray-400"
                      style={{
                        border: '1px solid #fed7aa',
                        background: '#fffbf7',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow =
                          '0 0 0 2px rgba(249,115,22,0.20)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#fed7aa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Info box */}
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                  style={{
                    background: '#fffbf7',
                    border: '1px solid #ffedd5',
                  }}
                >
                  <svg width="13" height="13" fill="none"
                    stroke="#f97316" strokeWidth="2"
                    viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8"  x2="12"    y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    We'll send a secure reset link to this address.
                    The link will expire in <strong>1 hour</strong>.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2
                             text-white text-sm font-bold py-3 rounded-xl
                             transition-all duration-200 active:scale-[0.97]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none"
                        viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12"
                          r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <svg width="15" height="15" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Back to login */}
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2
                             text-sm font-semibold py-2.5 rounded-xl
                             transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    color: '#c2410c',
                  }}
                >
                  <svg width="13" height="13" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </Link>

              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Remember your password?{' '}
          <Link to="/login"
            className="text-brand-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

// frontend/src/pages/VerifyNotice.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function VerifyNotice() {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [error,     setError]     = useState('');
  const [cooldown,  setCooldown]  = useState(0);

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await axios.post('/api/auth/resend-verification');
      setResent(true);

      // 60-second cooldown counter
      let secs = 60;
      setCooldown(secs);
      const tick = setInterval(() => {
        secs -= 1;
        setCooldown(secs);
        if (secs <= 0) {
          clearInterval(tick);
          setResent(false);
          setCooldown(0);
        }
      }, 1000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to resend verification email. Please try again.'
      );
    } finally {
      setResending(false);
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
          <div className="inline-flex items-center justify-center gap-2">
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
        </div>

        {/* ── Card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: '1px solid #ffedd5',
            boxShadow: '0 8px 32px rgba(249,115,22,0.12)',
          }}
        >
          {/* Orange top bar */}
          <div
            className="h-1"
            style={{
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          <div className="px-8 py-10 flex flex-col items-center text-center space-y-5">

            {/* Email icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                border: '1px solid #fed7aa',
              }}
            >
              <svg width="28" height="28" fill="none" stroke="#f97316"
                strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0
                     002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Badge */}
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full
                         uppercase tracking-wide"
              style={{
                background: '#ffedd5',
                color: '#c2410c',
                border: '1px solid #fed7aa',
              }}
            >
              Check Your Email
            </span>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900">
                Verify your email address
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                We sent a verification link to{' '}
                {user?.email ? (
                  <strong className="text-gray-700">{user.email}</strong>
                ) : (
                  'your email address'
                )}
                . Click the link in the email to activate your account.
              </p>
            </div>

            {/* Steps */}
            <div
              className="w-full rounded-xl px-4 py-4 space-y-3 text-left"
              style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
            >
              {[
                { step: '1', text: 'Open your email inbox' },
                { step: '2', text: 'Find the email from UrbantrustXchange' },
                { step: '3', text: 'Click the verification link inside' },
              ].map(item => (
                <div key={item.step} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center
                               justify-center text-white text-xs font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    }}
                  >
                    {item.step}
                  </span>
                  <p className="text-sm text-gray-600 font-medium">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div
                className="w-full rounded-xl px-4 py-3 flex items-start gap-2.5
                           text-sm animate-slide-up"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24"
                  className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12"    y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            {/* Resent success */}
            {resent && (
              <div
                className="w-full rounded-xl px-4 py-3 flex items-center
                           gap-2.5 text-sm animate-slide-up"
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">
                  Verification email resent! Check your inbox.
                  {cooldown > 0 && (
                    <span className="text-green-500 ml-1">
                      ({cooldown}s)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="w-full space-y-2.5 pt-1">

              {/* Go to Login */}
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2
                           text-white text-sm font-bold py-3 rounded-xl
                           transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4
                       M10 17l5-5-5-5M15 12H3" />
                </svg>
                Go to Login
              </Link>

              {/* Resend */}
              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="w-full flex items-center justify-center gap-2
                           text-sm font-semibold py-2.5 rounded-xl
                           transition-all duration-200 active:scale-[0.97]
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c',
                }}
              >
                {resending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none"
                      viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending…
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor"
                      strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                    </svg>
                    Resend Verification Email
                  </>
                )}
              </button>

            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-gray-400">
            Wrong email address?{' '}
            <Link to="/register" className="text-brand-500 hover:underline font-medium">
              Register again
            </Link>
          </p>
          <p className="text-xs text-gray-300">
            Check your spam or junk folder if you can't find the email.
          </p>
        </div>

      </div>
    </div>
  );
}

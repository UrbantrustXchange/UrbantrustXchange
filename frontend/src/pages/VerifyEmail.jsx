// frontend/src/pages/VerifyEmail.jsx

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR:   'error',
};

export default function VerifyEmail() {
  const [status,  setStatus]  = useState(STATUS.LOADING);
  const [message, setMessage] = useState('');
  const hasRun   = useRef(false);
  const navigate = useNavigate();
  const { markEmailVerified } = useAuth();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
      setStatus(STATUS.ERROR);
      setMessage('No verification token was found in the link. Please check your email and try again.');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await axios.post('/api/auth/verify-email', { token });

        // Update auth context so user is unblocked immediately
        markEmailVerified();

        setStatus(STATUS.SUCCESS);
        setMessage(data.message || 'Your email has been verified successfully.');

        // Redirect to login after short delay
        setTimeout(() => navigate('/login', { replace: true }), 3000);

      } catch (err) {
        setStatus(STATUS.ERROR);
        setMessage(
          err.response?.data?.message ||
          'Invalid or expired verification link. Please request a new one.'
        );
      }
    };

    verify();
  }, [navigate, markEmailVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#fff7ed' }}
    >
      <div className="w-full max-w-md animate-fade-in">

        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
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
          {/* Top accent bar */}
          <div
            className="h-1"
            style={{
              background: status === STATUS.ERROR
                ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                : status === STATUS.SUCCESS
                  ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                  : 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          <div className="px-8 py-10 flex flex-col items-center text-center space-y-5">

            {/* Status icon */}
            {status === STATUS.LOADING && (
              <div
                className="w-16 h-16 rounded-2xl flex items-center
                           justify-center"
                style={{ background: '#ffedd5', border: '1px solid #fed7aa' }}
              >
                <svg
                  className="animate-spin w-7 h-7"
                  fill="none" viewBox="0 0 24 24"
                  style={{ color: '#f97316' }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            )}

            {status === STATUS.SUCCESS && (
              <div
                className="w-16 h-16 rounded-2xl flex items-center
                           justify-center"
                style={{ background: '#DCFCE7', border: '1px solid #BBF7D0' }}
              >
                <svg width="30" height="30" fill="none" stroke="#16A34A"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {status === STATUS.ERROR && (
              <div
                className="w-16 h-16 rounded-2xl flex items-center
                           justify-center"
                style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}
              >
                <svg width="28" height="28" fill="none" stroke="#EF4444"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9"  x2="9"  y2="15" />
                  <line x1="9"  y1="9"  x2="15" y2="15" />
                </svg>
              </div>
            )}

            {/* Status badge */}
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full border
                         uppercase tracking-wide"
              style={
                status === STATUS.LOADING ? {
                  background: '#ffedd5',
                  color: '#c2410c',
                  borderColor: '#fed7aa',
                } : status === STATUS.SUCCESS ? {
                  background: '#DCFCE7',
                  color: '#166534',
                  borderColor: '#BBF7D0',
                } : {
                  background: '#FEE2E2',
                  color: '#991B1B',
                  borderColor: '#FECACA',
                }
              }
            >
              {status === STATUS.LOADING && 'Verifying…'}
              {status === STATUS.SUCCESS && '🎉 Verified'}
              {status === STATUS.ERROR   && 'Failed'}
            </span>

            {/* Heading */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-gray-900">
                {status === STATUS.LOADING && 'Verifying your email…'}
                {status === STATUS.SUCCESS && 'Email verified!'}
                {status === STATUS.ERROR   && 'Verification failed'}
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                {status === STATUS.LOADING && 'This will only take a moment. Please do not close this page.'}
                {status === STATUS.SUCCESS && 'Redirecting you to login in a few seconds…'}
                {status === STATUS.ERROR   && 'We could not verify your email address.'}
              </p>
            </div>

            {/* API message box */}
            {message && status !== STATUS.LOADING && (
              <div
                className="w-full rounded-xl px-4 py-3 text-sm text-left
                           flex items-start gap-2.5"
                style={status === STATUS.SUCCESS ? {
                  background: '#f0fdf4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                } : {
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                }}
              >
                {status === STATUS.SUCCESS ? (
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8"  x2="12"    y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <p className="leading-relaxed">{message}</p>
              </div>
            )}

            {/* Success redirect bar */}
            {status === STATUS.SUCCESS && (
              <div className="w-full space-y-3">
                <div
                  className="w-full rounded-xl px-4 py-3 flex items-center gap-2.5"
                  style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
                >
                  <svg className="animate-spin w-4 h-4 shrink-0"
                    fill="none" viewBox="0 0 24 24" style={{ color: '#f97316' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <p className="text-xs text-orange-700 font-medium">
                    Redirecting to login in 3 seconds…
                  </p>
                </div>

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
                  Continue to Login
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Error actions */}
            {status === STATUS.ERROR && (
              <div className="w-full space-y-2.5">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2
                             text-white text-sm font-bold py-3 rounded-xl
                             transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 14px rgba(249,115,22,0.30)',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                  Register Again
                </Link>
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
                  Back to Login
                </Link>
              </div>
            )}

            {/* Loading hint */}
            {status === STATUS.LOADING && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <svg width="12" height="12" fill="none" stroke="currentColor"
                  strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Checking token validity…
              </p>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          Didn't receive an email?{' '}
          <Link to="/login" className="text-brand-500 hover:underline font-medium">
            Sign in
          </Link>
          {' '}and request a new verification link from Settings.
        </p>

      </div>
    </div>
  );
}

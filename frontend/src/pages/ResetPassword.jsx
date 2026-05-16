// frontend/src/pages/ResetPassword.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token,     setToken]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');
  const [fieldErrs, setFieldErrs] = useState({});

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token');
    if (!t) {
      setError('No reset token found. Please request a new reset link.');
    } else {
      setToken(t);
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!password) e.password = 'New password is required.';
    else if (password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (!confirm) e.confirm = 'Please confirm your new password.';
    else if (confirm !== password) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handle = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrs(errs); return; }
    setFieldErrs({});
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input style ─────────────────────────────────────────────
  const inputStyle = (field) => ({
    border: fieldErrs[field] ? '1px solid #FECACA' : '1px solid #fed7aa',
    background: fieldErrs[field] ? '#FEF2F2' : '#fffbf7',
  });

  const onFocus = e => {
    e.target.style.borderColor = '#f97316';
    e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.20)';
  };
  const onBlur = (e, field) => {
    e.target.style.borderColor = fieldErrs[field] ? '#FECACA' : '#fed7aa';
    e.target.style.boxShadow = 'none';
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
            Reset your password
          </h1>
          <p className="text-sm text-gray-400">
            Choose a strong new password for your account.
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
              background: success
                ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                : error && !token
                  ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                  : 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          <div className="px-8 py-8">

            {/* ── Success state ── */}
            {success ? (
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
                      d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Password reset successfully!
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Your password has been updated. Redirecting you to
                    login in 3 seconds…
                  </p>
                </div>

                <div
                  className="w-full rounded-xl px-4 py-3 flex items-center
                             gap-2.5"
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                  }}
                >
                  <svg className="animate-spin w-4 h-4 shrink-0"
                    fill="none" viewBox="0 0 24 24"
                    style={{ color: '#f97316' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <p className="text-xs text-orange-700 font-medium">
                    Redirecting to login…
                  </p>
                </div>

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
                  Continue to Login
                  <svg width="14" height="14" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4
                         M10 17l5-5-5-5M15 12H3" />
                  </svg>
                </Link>
              </div>

            ) : !token ? (

              /* ── No token state ── */
              <div className="flex flex-col items-center text-center
                              space-y-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center
                             justify-center"
                  style={{
                    background: '#FEE2E2',
                    border: '1px solid #FECACA',
                  }}
                >
                  <svg width="28" height="28" fill="none" stroke="#EF4444"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9"  x2="9"  y2="15" />
                    <line x1="9"  y1="9"  x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    Invalid reset link
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    This link is missing a token. Please request a new
                    password reset link.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="w-full flex items-center justify-center gap-2
                             text-white text-sm font-bold py-3 rounded-xl
                             transition-all active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 14px rgba(249,115,22,0.25)',
                  }}
                >
                  Request New Link
                </Link>
              </div>

            ) : (

              /* ── Form state ── */
              <form onSubmit={handle} noValidate className="space-y-5">

                {/* API error */}
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
                    <div>
                      <p className="font-medium">{error}</p>
                      <Link to="/forgot-password"
                        className="text-xs underline mt-0.5 inline-block"
                        style={{ color: '#991B1B' }}
                      >
                        Request a new reset link →
                      </Link>
                    </div>
                  </div>
                )}

                {/* New password */}
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2
                                     -translate-y-1/2 text-gray-400">
                      <svg width="15" height="15" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11"
                          rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setFieldErrs(f => ({ ...f, password: '' }));
                      }}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      className="w-full rounded-xl pl-9 pr-10 py-2.5
                                 text-sm text-gray-900 transition-all
                                 focus:outline-none focus:bg-white
                                 placeholder:text-gray-400"
                      style={inputStyle('password')}
                      onFocus={onFocus}
                      onBlur={e => onBlur(e, 'password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-gray-400 hover:text-brand-500
                                 transition-colors"
                    >
                      {showPass ? (
                        <svg width="16" height="16" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20
                                   c-7 0-11-8-11-8a18.45 18.45 0
                                   015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0
                                   11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11
                                   8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrs.password && (
                    <p className="mt-1.5 text-xs text-red-500
                                  flex items-center gap-1">
                      <svg width="11" height="11" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8"  x2="12"    y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {fieldErrs.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2
                                     -translate-y-1/2 text-gray-400">
                      <svg width="15" height="15" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0
                             0112 2.944a11.955 11.955 0 01-8.618 3.04
                             A12.02 12.02 0 003 9c0 5.591 3.824 10.29
                             9 11.622 5.176-1.332 9-6.03 9-11.622
                             0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => {
                        setConfirm(e.target.value);
                        setFieldErrs(f => ({ ...f, confirm: '' }));
                      }}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      className="w-full rounded-xl pl-9 pr-10 py-2.5
                                 text-sm text-gray-900 transition-all
                                 focus:outline-none focus:bg-white
                                 placeholder:text-gray-400"
                      style={inputStyle('confirm')}
                      onFocus={onFocus}
                      onBlur={e => onBlur(e, 'confirm')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-gray-400 hover:text-brand-500
                                 transition-colors"
                    >
                      {showConf ? (
                        <svg width="16" height="16" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20
                                   c-7 0-11-8-11-8a18.45 18.45 0
                                   015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0
                                   11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11
                                   8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrs.confirm ? (
                    <p className="mt-1.5 text-xs text-red-500
                                  flex items-center gap-1">
                      <svg width="11" height="11" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8"  x2="12"    y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {fieldErrs.confirm}
                    </p>
                  ) : confirm && confirm === password ? (
                    <p className="mt-1.5 text-xs text-green-600
                                  flex items-center gap-1">
                      <svg width="11" height="11" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  ) : null}
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
                      Resetting…
                    </>
                  ) : (
                    <>
                      Reset Password
                      <svg width="15" height="15" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>

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

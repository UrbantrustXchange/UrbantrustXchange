// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = field => e =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handle = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">

        {/* ── Brand mark ── */}
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
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to your trading account
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden border border-orange-100"
          style={{ boxShadow: '0 4px 24px rgba(249,115,22,0.10)' }}
        >
          {/* Orange top bar */}
          <div
            className="h-1"
            style={{
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          <div className="p-8">

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3
                           mb-5 animate-slide-up"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}
              >
                <svg width="15" height="15" fill="none" stroke="#EF4444"
                  strokeWidth="2.5" viewBox="0 0 24 24"
                  className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12"    y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handle} className="space-y-5" noValidate>

              {/* Email */}
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2
                               2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@email.com"
                    autoComplete="email"
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm
                               text-gray-900 focus:outline-none focus:bg-white
                               transition-all duration-200 placeholder:text-gray-400"
                    style={{ border: '1px solid #fed7aa', background: '#fffbf7' }}
                    onFocus={e => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.20)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#fed7aa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  {/* ✅ Forgot password link wired up */}
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#f97316' }}
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    required
                    value={form.password}
                    onChange={update('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl pl-9 pr-10 py-2.5 text-sm
                               text-gray-900 focus:outline-none focus:bg-white
                               transition-all duration-200 placeholder:text-gray-400"
                    style={{ border: '1px solid #fed7aa', background: '#fffbf7' }}
                    onFocus={e => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.20)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#fed7aa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-brand-500 transition-colors"
                  >
                    {showPass ? (
                      <svg width="16" height="16" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20
                                 c-7 0-11-8-11-8a18.45 18.45 0
                                 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8
                                 11 8a18.5 18.5 0 01-2.16 3.19" />
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
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2
                           text-white font-bold text-sm py-3 rounded-xl
                           transition-all duration-200 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? '#fdba74'
                    : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 14px rgba(249,115,22,0.35)',
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
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4
                           M10 17l5-5-5-5M15 12H3" />
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-orange-100" />
              <span className="text-xs text-gray-400 font-medium">
                New to UrbantrustXchange?
              </span>
              <div className="flex-1 border-t border-orange-100" />
            </div>

            {/* Register link */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2
                         text-sm font-semibold py-2.5 rounded-xl
                         transition-all duration-200 active:scale-[0.98]"
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#c2410c',
              }}
            >
              Create a free account
              <svg width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8
                     0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} UrbantrustXchange. All rights reserved.
        </p>

      </div>
    </div>
  );
}

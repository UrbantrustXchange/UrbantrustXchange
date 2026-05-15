import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: '', phoneNumber: '', password: '', confirm: '',
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const update = field => e =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email.trim())
      e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.';

    if (!form.phoneNumber.trim())
      e.phoneNumber = 'Phone number is required.';
    else if (!/^\+?[0-9\s\-().]{7,20}$/.test(form.phoneNumber))
      e.phoneNumber = 'Enter a valid phone number.';

    if (!form.password)
      e.password = 'Password is required.';
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';

    if (!form.confirm)
      e.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password)
      e.confirm = 'Passwords do not match.';

    return e;
  };

  const handle = async e => {
    e.preventDefault();
    setApiError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(form.email, form.password, form.phoneNumber);
      setForm({ email: '', phoneNumber: '', password: '', confirm: '' });
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field) => `
    w-full border rounded-xl px-3 py-2.5 text-sm
    bg-orange-50 text-gray-900
    focus:outline-none focus:ring-2 focus:border-transparent
    focus:bg-white transition-all duration-200
    placeholder:text-gray-400
    ${errors[field]
      ? 'border-red-300 focus:ring-red-400'
      : 'border-orange-200 focus:ring-brand-500'
    }
  `;

  const ErrMsg = ({ field }) => errors[field] ? (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <svg width="11" height="11" fill="none" stroke="currentColor"
        strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8"  x2="12"    y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {errors[field]}
    </p>
  ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">

        {/* ── Brand mark ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
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
            Create your account
          </h1>
          <p className="text-sm text-gray-500">
            Join thousands trading on UrbantrustXchange
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="bg-white rounded-2xl p-8 border border-orange-100"
          style={{ boxShadow: '0 4px 24px rgba(249,115,22,0.10)' }}
        >
          {/* Orange top bar */}
          <div
            className="h-1 rounded-t-xl -mt-8 mb-6 -mx-8"
            style={{
              background: 'linear-gradient(90deg, #f97316, #ea580c)',
            }}
          />

          {/* API Error */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200
                            rounded-xl px-4 py-3 mb-5 animate-slide-up">
              <svg width="15" height="15" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24"
                className="text-red-500 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <form onSubmit={handle} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2
                             2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className={`${fieldClass('email')} pl-9`}
                />
              </div>
              <ErrMsg field="email" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone number <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0
                         01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79
                         19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0
                         012 1.72 12.84 12.84 0 00.7 2.81 2 2 0
                         01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2
                         2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0
                         0122 16.92z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={update('phoneNumber')}
                  placeholder="+233 24 000 0000"
                  autoComplete="tel"
                  className={`${fieldClass('phoneNumber')} pl-9`}
                />
              </div>
              <ErrMsg field="phoneNumber" />
              {!errors.phoneNumber && (
                <p className="mt-1 text-xs text-gray-400">
                  Include country code e.g. +233 24 000 0000
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`${fieldClass('password')} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-brand-500 transition-colors"
                >
                  {showPass ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7
                               0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8
                               11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <ErrMsg field="password" />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0
                         0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02
                         12.02 0 003 9c0 5.591 3.824 10.29 9 11.622
                         5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052
                         -.382-3.016z" />
                  </svg>
                </span>
                <input
                  type={showConf ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`${fieldClass('confirm')} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-brand-500 transition-colors"
                >
                  {showConf ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7
                               0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8
                               11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirm ? (
                <ErrMsg field="confirm" />
              ) : form.confirm && form.confirm === form.password ? (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <svg width="11" height="11" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </p>
              ) : null}
            </div>

            {/* Terms note */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link to="/rules" className="text-brand-500 hover:underline font-medium">
                platform rules
              </Link>
              {' '}and trading policies.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                         text-white font-semibold text-sm
                         py-3 rounded-xl
                         transition-all duration-200
                         active:scale-[0.98]
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
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <svg width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0
                         11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-orange-100" />
            <span className="text-xs text-gray-400 font-medium">
              Already have an account?
            </span>
            <div className="flex-1 border-t border-orange-100" />
          </div>

          {/* Sign in link */}
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2
                       bg-orange-50 hover:bg-orange-100
                       text-brand-600 font-semibold text-sm
                       py-2.5 rounded-xl
                       border border-orange-200
                       transition-all duration-200
                       active:scale-[0.98]"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10
                   17l5-5-5-5M15 12H3" />
            </svg>
            Sign in instead
          </Link>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} UrbantrustXchange. All rights reserved.
        </p>

      </div>
    </div>
  );
}
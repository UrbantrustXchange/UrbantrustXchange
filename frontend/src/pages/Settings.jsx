// frontend/src/pages/Settings.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-start gap-3
                 px-4 py-3 rounded-2xl max-w-sm animate-slide-up"
      style={{
        background: isSuccess ? '#f0fdf4' : '#FEF2F2',
        border:     isSuccess ? '1px solid #BBF7D0' : '1px solid #FECACA',
        boxShadow:  '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: isSuccess ? '#DCFCE7' : '#FEE2E2' }}
      >
        {isSuccess ? (
          <svg width="14" height="14" fill="none" stroke="#16A34A"
            strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="#DC2626"
            strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"    y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>
      <p
        className="text-sm leading-relaxed flex-1 font-medium"
        style={{ color: isSuccess ? '#166534' : '#991B1B' }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor"
          strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Password field ─────────────────────────────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
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
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl pl-9 pr-10 py-2.5 text-sm
                     transition-all duration-200 placeholder:text-gray-400
                     focus:outline-none focus:bg-white"
          style={{
            border:     error ? '1px solid #FECACA' : '1px solid #fed7aa',
            background: error ? '#FEF2F2' : '#fffbf7',
            boxShadow:  'none',
          }}
          onFocus={e => {
            e.target.style.boxShadow = error
              ? '0 0 0 2px rgba(239,68,68,0.20)'
              : '0 0 0 2px rgba(249,115,22,0.20)';
            e.target.style.borderColor = error ? '#EF4444' : '#f97316';
          }}
          onBlur={e => {
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = error ? '#FECACA' : '#fed7aa';
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-brand-500 transition-colors"
        >
          {show ? (
            <svg width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8
                       a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8
                       a18.5 18.5 0 01-2.16 3.19" />
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
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg width="11" height="11" fill="none" stroke="currentColor"
            strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"    y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, icon, accentColor = '#f97316', children }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        border: '1px solid #ffedd5',
        boxShadow: '0 2px 12px rgba(249,115,22,0.08)',
      }}
    >
      <div
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}
      />
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: '#fff7ed', background: '#fffbf7' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: '#ffedd5', border: '1px solid #fed7aa' }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Orange button ──────────────────────────────────────────────────────────────
function OrangeButton({ onClick, disabled, loading, children, fullWidth = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        text-white text-sm font-bold py-2.5 px-5 rounded-xl
        transition-all duration-200 active:scale-[0.97]
        disabled:cursor-not-allowed disabled:opacity-50
      `}
      style={{
        background: disabled || loading
          ? '#e5e7eb'
          : 'linear-gradient(135deg, #f97316, #ea580c)',
        color: disabled || loading ? '#9ca3af' : 'white',
        boxShadow: disabled || loading
          ? 'none'
          : '0 4px 12px rgba(249,115,22,0.30)',
      }}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

// ── Delete modal ───────────────────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel, loading }) {
  const [confirmText, setConfirmText] = useState('');
  const ready = confirmText === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md p-6
                   space-y-5 animate-slide-up"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.20)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center
                       justify-center shrink-0"
            style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}
          >
            <svg width="20" height="20" fill="none" stroke="#EF4444"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Delete Account
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              This action is permanent and cannot be undone
            </p>
          </div>
        </div>

        {/* Warning list */}
        <div
          className="rounded-xl px-4 py-3 space-y-2"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          <p className="text-sm font-semibold text-red-800 mb-2">
            You will permanently lose:
          </p>
          {[
            'Your account and profile information',
            'Complete trade history',
            'Any pending or active transactions',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <p className="text-xs text-red-700">{item}</p>
            </div>
          ))}
        </div>

        {/* Confirm input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Type{' '}
            <code
              className="font-mono font-black px-1.5 py-0.5 rounded text-sm"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
            >
              DELETE
            </code>{' '}
            to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-mono
                       focus:outline-none transition-all"
            style={{
              border: '1px solid #FECACA',
              background: '#FEF2F2',
            }}
            placeholder="Type DELETE here"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-700
                       text-sm font-semibold py-2.5 rounded-xl
                       hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!ready || loading}
            className="flex-1 text-white text-sm font-bold py-2.5
                       rounded-xl transition-all flex items-center
                       justify-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: ready && !loading
                ? '#EF4444'
                : '#e5e7eb',
              color: ready && !loading ? 'white' : '#9ca3af',
            }}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none"
                viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            )}
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [toast,           setToast]           = useState(null);
  const [phone,           setPhone]           = useState(user?.phoneNumber || '');
  const [profileSaving,   setProfileSaving]   = useState(false);
  const [pwForm,          setPwForm]          = useState({ current: '', next: '', confirm: '' });
  const [pwErrors,        setPwErrors]        = useState({});
  const [pwSaving,        setPwSaving]        = useState(false);
  const [resending,       setResending]       = useState(false);
  const [resent,          setResent]          = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);

  const showToast = (message, type = 'success') =>
    setToast({ message, type });

  useEffect(() => {
    if (user?.phoneNumber) setPhone(user.phoneNumber);
  }, [user]);

  // ── Profile ────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!phone.trim())
      return showToast('Phone number cannot be empty.', 'error');
    if (!/^\+?[0-9\s\-().]{7,20}$/.test(phone.trim()))
      return showToast('Enter a valid phone number.', 'error');
    setProfileSaving(true);
    try {
      await axios.put('/api/users/profile', { phoneNumber: phone.trim() });
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally { setProfileSaving(false); }
  };

  // ── Password ───────────────────────────────────────────────────────
  const validatePassword = () => {
    const e = {};
    if (!pwForm.current) e.current = 'Current password is required.';
    if (!pwForm.next) e.next = 'New password is required.';
    else if (pwForm.next.length < 6) e.next = 'Must be at least 6 characters.';
    if (!pwForm.confirm) e.confirm = 'Please confirm your new password.';
    else if (pwForm.confirm !== pwForm.next) e.confirm = 'Passwords do not match.';
    if (pwForm.current && pwForm.next && pwForm.current === pwForm.next)
      e.next = 'New password must differ from current.';
    return e;
  };

  const handlePasswordSave = async () => {
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwSaving(true);
    try {
      await axios.put('/api/users/change-password', {
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
      });
      setPwForm({ current: '', next: '', confirm: '' });
      showToast('Password changed successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally { setPwSaving(false); }
  };

  // ── Resend verification ────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post('/api/auth/resend-verification');
      setResent(true);
      showToast('Verification email sent. Check your inbox.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send email.', 'error');
    } finally { setResending(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete('/api/users/account');
      logout();
      navigate('/register');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account.', 'error');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const inputStyle = {
    base: {
      border: '1px solid #fed7aa',
      background: '#fffbf7',
    },
  };

  return (
    <div className="min-h-screen animate-fade-in">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your UrbantrustXchange account
            </p>
          </div>
          {/* Account badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-2
                       rounded-xl border"
            style={{ background: '#fff7ed', borderColor: '#fed7aa' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center
                         text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* ── 1. Profile ── */}
        <SectionCard
          title="Profile Information"
          subtitle="Update your personal contact details"
          icon="👤"
          accentColor="#f97316"
        >
          <div className="space-y-4">

            {/* Email — readonly */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
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
                  value={user?.email || ''}
                  readOnly
                  className="w-full rounded-xl pl-9 pr-20 py-2.5 text-sm
                             text-gray-500 cursor-not-allowed"
                  style={{
                    border: '1px solid #f3f4f6',
                    background: '#f9fafb',
                  }}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: '#f3f4f6', color: '#9ca3af' }}
                >
                  Locked
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Email address cannot be changed after registration.
              </p>
            </div>

            {/* Phone — editable */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone number
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
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm
                             text-gray-900 transition-all duration-200
                             focus:outline-none focus:bg-white
                             placeholder:text-gray-400"
                  style={inputStyle.base}
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
              <p className="mt-1 text-xs text-gray-400">
                Include country code — e.g. +233 24 000 0000
              </p>
            </div>

            {/* Total traded stat */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <p className="text-xs font-medium text-gray-600">
                  Total Traded
                </p>
              </div>
              <p className="text-sm font-bold text-brand-600">
                ${user?.totalTradedUSD?.toFixed(2) || '0.00'} USD
              </p>
            </div>

            <div className="flex justify-end">
              <OrangeButton
                onClick={handleProfileSave}
                loading={profileSaving}
              >
                {!profileSaving && (
                  <svg width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </OrangeButton>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Security ── */}
        <SectionCard
          title="Security"
          subtitle="Update your account password"
          icon="🔒"
          accentColor="#3B82F6"
        >
          <div className="space-y-4">
            <PasswordField
              label="Current Password"
              value={pwForm.current}
              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
              placeholder="Enter your current password"
              error={pwErrors.current}
            />
            <PasswordField
              label="New Password"
              value={pwForm.next}
              onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
              placeholder="Min. 6 characters"
              error={pwErrors.next}
            />
            <PasswordField
              label="Confirm New Password"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Re-enter your new password"
              error={pwErrors.confirm}
            />

            {/* Password match indicator */}
            {pwForm.confirm && !pwErrors.confirm &&
             pwForm.confirm === pwForm.next && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <svg width="11" height="11" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M5 13l4 4L19 7" />
                </svg>
                Passwords match
              </p>
            )}

            {/* Password strength hint */}
            <div
              className="rounded-xl px-4 py-3 flex items-start gap-2.5"
              style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
            >
              <svg width="13" height="13" fill="none" stroke="#f97316"
                strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-gray-500 leading-relaxed">
                Use a strong password with at least 8 characters, including
                numbers and symbols.
              </p>
            </div>

            <div className="flex justify-end">
              <OrangeButton
                onClick={handlePasswordSave}
                loading={pwSaving}
              >
                {!pwSaving && (
                  <svg width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                {pwSaving ? 'Updating…' : 'Update Password'}
              </OrangeButton>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Verification ── */}
        <SectionCard
          title="Email Verification"
          subtitle="Verify your email for full platform access"
          icon="✉️"
          accentColor="#F59E0B"
        >
          {/* Email + badge row */}
          <div
            className="flex items-center justify-between rounded-xl
                       px-4 py-3 mb-4"
            style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center
                           justify-center shrink-0"
                style={{ background: '#ffedd5' }}
              >
                <svg width="14" height="14" fill="none" stroke="#f97316"
                  strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2
                           2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Account email address
                </p>
              </div>
            </div>
            {user?.isEmailVerified ? (
              <span
                className="flex items-center gap-1.5 text-xs font-bold
                           px-3 py-1.5 rounded-full shrink-0 ml-2"
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                }}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor"
                  strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 text-xs font-bold
                           px-3 py-1.5 rounded-full shrink-0 ml-2"
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                }}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor"
                  strokeWidth="3" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12"    y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Unverified
              </span>
            )}
          </div>

          {user?.isEmailVerified ? (
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: '#f0fdf4', border: '1px solid #BBF7D0' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center
                           justify-center shrink-0"
                style={{ background: '#DCFCE7' }}
              >
                <svg width="13" height="13" fill="none" stroke="#16A34A"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0
                       0112 2.944a11.955 11.955 0 01-8.618 3.04
                       A12.02 12.02 0 003 9c0 5.591 3.824 10.29
                       9 11.622 5.176-1.332 9-6.03 9-11.622
                       0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">
                  Email verified
                </p>
                <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
                  Your identity is confirmed. You have full access to
                  all platform features.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: '#fffbf7', border: '1px solid #fed7aa' }}
              >
                <svg width="15" height="15" fill="none" stroke="#f97316"
                  strokeWidth="2.5" viewBox="0 0 24 24"
                  className="shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0
                       001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2
                       2 0 00-3.42 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-orange-800">
                    Email not verified
                  </p>
                  <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                    Verify your email address to unlock full trading access
                    and secure your account.
                  </p>
                </div>
              </div>

              {resent ? (
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: '#f0fdf4', border: '1px solid #BBF7D0' }}
                >
                  <span className="text-base">📬</span>
                  <p className="text-sm font-medium text-green-700">
                    Verification email sent! Check your inbox and spam folder.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2
                             text-sm font-semibold py-2.5 rounded-xl
                             transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    color: '#c2410c',
                  }}
                >
                  {resending ? (
                    <svg className="animate-spin w-4 h-4" fill="none"
                      viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" fill="none" stroke="currentColor"
                      strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2
                               2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  )}
                  {resending ? 'Sending…' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── 4. Account ── */}
        <SectionCard
          title="Account Management"
          subtitle="Control your account access and data"
          icon="⚙️"
          accentColor="#EF4444"
        >
          <div className="space-y-3">

            {/* Logout row */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center
                             justify-center shrink-0"
                  style={{ background: '#ffedd5' }}
                >
                  <svg width="14" height="14" fill="none" stroke="#f97316"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0
                         01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2
                         2 0 012 2v1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Sign out
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    End your current session
                  </p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 text-sm font-semibold
                           px-4 py-2 rounded-xl transition-all duration-200
                           active:scale-[0.97]"
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c',
                }}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0
                       01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Delete row */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center
                             justify-center shrink-0"
                  style={{ background: '#FEE2E2' }}
                >
                  <svg width="14" height="14" fill="none" stroke="#EF4444"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Delete account
                  </p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Permanently remove your account and all data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 text-white text-sm
                           font-semibold px-4 py-2 rounded-xl
                           transition-all duration-200 active:scale-[0.97]"
                style={{ background: '#EF4444' }}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Footer ── */}
        <div className="text-center pb-4 space-y-1">
          <p className="text-xs text-gray-400">
            UrbantrustXchange &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-300">
            All rights reserved · Secure Trading Platform
          </p>
        </div>

      </div>
    </div>
  );
}
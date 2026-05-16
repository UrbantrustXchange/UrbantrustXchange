import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',        label: 'Home',     icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { to: '/history', label: 'History',  icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )},
  { to: '/rules',   label: 'Rules',    icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { to: '/settings',label: 'Settings', icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )},
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <nav
      className="bg-white sticky top-0 z-50"
      style={{
        borderBottom: '1px solid #ffedd5',
        boxShadow: '0 2px 12px rgba(249,115,22,0.08)',
      }}
    >
      {/* Orange gradient top line */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #f97316 0%, #fb923c 50%, #ea580c 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            <svg width="16" height="16" fill="none" stroke="white"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base leading-tight">
            Urbantrust<span className="text-brand-500">Xchange</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                  font-medium transition-all duration-200
                  ${isActive(link.to)
                    ? 'text-brand-600 bg-orange-50'
                    : 'text-gray-600 hover:text-brand-600 hover:bg-orange-50'
                  }
                `}
                style={isActive(link.to) ? {
                  borderBottom: '2px solid #f97316',
                } : {}}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive('/admin')
                    ? 'text-brand-600 bg-orange-50'
                    : 'text-gray-600 hover:text-brand-600 hover:bg-orange-50'
                  }
                `}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor"
                  strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
                </svg>
                Admin
              </Link>
            )}
          </div>
        )}

        {/* ── Right side ── */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* User pill */}
              <div className="hidden md:flex items-center gap-2 bg-orange-50
                              border border-orange-200 rounded-xl px-3 py-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center
                               text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                  {user.email}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-1.5 px-3 py-2
                           rounded-lg border border-orange-200 text-sm font-medium
                           text-gray-600 hover:text-brand-600 hover:bg-orange-50
                           transition-all duration-200"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor"
                  strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2
                       2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="md:hidden p-2 rounded-lg text-gray-600
                           hover:bg-orange-50 transition-colors"
              >
                {menuOpen ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor"
                    strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium
                           text-gray-600 hover:text-brand-600
                           hover:bg-orange-50 border border-transparent
                           hover:border-orange-200 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold
                           text-white transition-all duration-200
                           active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.30)',
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {user && menuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1 animate-slide-up"
          style={{ borderColor: '#ffedd5', background: '#fffbf7' }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive(link.to)
                  ? 'text-brand-600 bg-orange-100'
                  : 'text-gray-600 hover:text-brand-600 hover:bg-orange-50'
                }
              `}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                         text-sm font-medium text-gray-600
                         hover:text-brand-600 hover:bg-orange-50 transition-all"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0
                     0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
              </svg>
              Admin
            </Link>
          )}

          <div className="pt-2 border-t" style={{ borderColor: '#ffedd5' }}>
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center
                             text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                         text-sm font-medium text-red-600
                         hover:bg-red-50 transition-all"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2
                     2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

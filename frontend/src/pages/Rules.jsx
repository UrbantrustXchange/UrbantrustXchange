// frontend/src/pages/Rules.jsx

import { Link } from 'react-router-dom';

const sections = [
  {
    icon: '🪪',
    title: 'User Verification (KYC)',
    rules: [
      'All users must provide valid identification before trading.',
      'Accounts with false or suspicious details will be suspended immediately.',
    ],
  },
  {
    icon: '✅',
    title: 'Trade Confirmation',
    rules: [
      'All trades must be confirmed before processing.',
      'Completed trades cannot be reversed.',
    ],
  },
  {
    icon: '💳',
    title: 'Payment Rules',
    rules: [
      'Use only approved payment methods.',
      'Upload proof of payment (POP).',
      'Fake POP results in a permanent ban.',
    ],
  },
  {
    icon: '🎁',
    title: 'Gift Card Requirements',
    rules: [
      'Only valid, unused gift cards are accepted.',
      'Cards must be clearly visible in uploaded images.',
      'Invalid cards may result in account penalties.',
    ],
  },
  {
    icon: '⏱️',
    title: 'Trade Time Limits',
    rules: [
      'Trades must be completed within 15–30 minutes of initiation.',
      'Late payments will automatically cancel the trade.',
    ],
  },
  {
    icon: '⚖️',
    title: 'Dispute Resolution',
    rules: [
      'Users must open disputes within the platform only.',
      'Full evidence must be provided to support any claim.',
      'Admin decisions are final and binding.',
    ],
  },
  {
    icon: '🚫',
    title: 'Prohibited Activities',
    rules: [
      'No fraud, scams, or chargebacks of any kind.',
      'Stolen or fraudulent cards are strictly prohibited.',
      'Violations lead to immediate suspension or permanent termination.',
    ],
    danger: true,
  },
];

export default function Rules() {
  return (
    <div className="min-h-screen animate-fade-in">

      {/* ── Hero header ── */}
      <div
        className="rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          boxShadow: '0 8px 32px rgba(249,115,22,0.25)',
        }}
      >
        {/* Watermark pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='11' font-weight='800' fill='%23ffffff' fill-opacity='0.07' transform='rotate(-20 100 40)'%3EUrbantrustXchange%3C/text%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="relative z-10">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold
                       px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(255,255,255,0.20)', color: 'white' }}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor"
              strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0
                   012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0
                   01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Platform Policy
          </span>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Rules & Regulations
          </h1>
          <p className="text-orange-100 text-sm max-w-md mx-auto leading-relaxed">
            Please read and follow all platform rules carefully.
            Violations may result in account suspension or permanent termination.
          </p>
        </div>
      </div>

      {/* ── Rules list ── */}
      <div className="space-y-3 mb-6">
        {sections.map((section, idx) => (
          <div
            key={section.title}
            className="rounded-2xl overflow-hidden animate-fade-in"
            style={{
              background:   section.danger ? '#FEF2F2' : '#ffffff',
              border:       section.danger
                ? '1px solid #FECACA'
                : '1px solid #ffedd5',
              boxShadow: section.danger
                ? 'none'
                : '0 2px 8px rgba(249,115,22,0.06)',
              animationDelay: `${idx * 0.05}s`,
            }}
          >
            {/* Section top bar */}
            <div
              className="h-0.5"
              style={{
                background: section.danger
                  ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                  : 'linear-gradient(90deg, #f97316, #ea580c)',
              }}
            />

            <div className="p-5">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center
                             justify-center text-lg shrink-0"
                  style={{
                    background: section.danger ? '#FEE2E2' : '#ffedd5',
                    border:     section.danger
                      ? '1px solid #FECACA'
                      : '1px solid #fed7aa',
                  }}
                >
                  {section.icon}
                </div>
                <div>
                  <h2
                    className="font-bold text-sm"
                    style={{ color: section.danger ? '#991B1B' : '#111827' }}
                  >
                    {section.title}
                  </h2>
                  <p className="text-xs mt-0.5"
                    style={{ color: section.danger ? '#DC2626' : '#f97316' }}
                  >
                    {section.rules.length} rule{section.rules.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Rules */}
              <ul className="space-y-2.5">
                {section.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center w-5 h-5
                                 rounded-full text-white text-[10px] font-bold
                                 shrink-0 mt-0.5"
                      style={{
                        background: section.danger
                          ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                          : 'linear-gradient(135deg, #f97316, #ea580c)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: section.danger ? '#7F1D1D' : '#374151' }}
                    >
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer note ── */}
      <div
        className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
        style={{ background: '#fffbf7', border: '1px solid #ffedd5' }}
      >
        <svg width="15" height="15" fill="none" stroke="#f97316"
          strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8"  x2="12"    y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-gray-500 leading-relaxed">
          These rules are subject to change at any time. Continued use of
          <strong className="text-gray-700"> UrbantrustXchange </strong>
          implies acceptance of the latest version of these rules and policies.
        </p>
      </div>

      {/* ── Back to Home ── */}
      <div className="flex justify-center pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white text-sm
                     font-bold px-6 py-3 rounded-xl transition-all duration-200
                     active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
          }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor"
            strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2
                 m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0
                 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </Link>
      </div>

    </div>
  );
}

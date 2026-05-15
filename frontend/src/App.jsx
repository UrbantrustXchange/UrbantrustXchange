// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar         from './components/Navbar';
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import SellGiftCard   from './pages/SellGiftCard';
import SellBTC        from './pages/SellBTC';
import History        from './pages/History';
import TradeDetail    from './pages/TradeDetail';
import AdminPanel     from './pages/AdminPanel';
import AdminChat      from './pages/AdminChat';
import ModeratorPanel from './pages/ModeratorPanel';
import VerifyEmail    from './pages/VerifyEmail';
import VerifyNotice   from './pages/VerifyNotice';
import Rules          from './pages/Rules';
import Settings       from './pages/Settings';      // ← correct casing
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// ── 404 ───────────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
        style={{ background: '#ffedd5' }}
      >
        🔍
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-400 mb-6">The page you are looking for does not exist.</p>
      <a
        href="/"
        className="inline-flex items-center gap-2 text-white text-sm font-bold
                   px-5 py-2.5 rounded-xl transition-all active:scale-[0.97]"
        style={{
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          boxShadow: '0 4px 12px rgba(249,115,22,0.30)',
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

// ── Route guards ───────────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { user, loading, isEmailVerified } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isEmailVerified) return <Navigate to="/verify-notice" replace />;

  return children;
}

// AdminRoute: must be logged in, verified, and admin role
function AdminRoute({ children }) {
  const { user, loading, isEmailVerified } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-6 h-6 rounded-full border-2 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isEmailVerified) return <Navigate to="/verify-notice" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
function ModeratorRoute({ children }) {
  const { user, loading, isEmailVerified } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-6 h-6 rounded-full border-2 border-orange-200 border-t-orange-500" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (!isEmailVerified) return <Navigate to="/verify-notice" replace />;
  if (!['admin', 'moderator'].includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
// ── Layout ─────────────────────────────────────────────────────────────────────
function Layout({ children }) {
  const location = useLocation();

  const hideNavbarRoutes = [
    '/login',
    '/register',
    '/verify-email',
    '/verify-notice',
    '/forgot-password',
    '/reset-password',
  ];

  const hideNavbar = hideNavbarRoutes.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '14px',
          },
        }}
      />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}

// ── App content ────────────────────────────────────────────────────────────────
function AppContent() {
  return (
    <Layout>
      <Routes>

        {/* Public */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/verify-notice"   element={<VerifyNotice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/rules"           element={<Rules />} />

        {/* Protected */}
        <Route path="/"            element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/sell/giftcard" element={<PrivateRoute><SellGiftCard /></PrivateRoute>} />
        <Route path="/sell/btc"    element={<PrivateRoute><SellBTC /></PrivateRoute>} />
        <Route path="/history"     element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/trade/:id"   element={<PrivateRoute><TradeDetail /></PrivateRoute>} />
        <Route path="/settings"    element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/chat/:id" element={<AdminRoute><AdminChat /></AdminRoute>} />
        <Route path="/moderator" element={<ModeratorRoute><ModeratorPanel /></ModeratorRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Layout>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

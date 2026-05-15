import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

const PUBLIC_PATHS = ['/login', '/register', '/verify-email', '/verify-notice', '/forgot-password', '/reset-password'];

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const enforceEmailVerification = useCallback((resolvedUser) => {
    if (!resolvedUser) return;
    const onPublicPath = PUBLIC_PATHS.some(p => window.location.pathname.startsWith(p));
    if (!resolvedUser.isEmailVerified && !onPublicPath) {
      navigate('/verify-notice', { replace: true });
    }
  }, [navigate]);

  // Hydrate session on first load
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthHeader(token);
    axios
      .get('/api/auth/me')
      .then(({ data }) => {
        setUser(data);
        enforceEmailVerification(data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setAuthHeader(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });

    localStorage.setItem('token', data.token);
    setAuthHeader(data.token);
    setToken(data.token);
    setUser(data.user);

    if (!data.user.isEmailVerified) {
      navigate('/verify-notice', { replace: true });
      return;
    }

   if (data.user.role === 'admin') {
  navigate('/admin', { replace: true });
} else if (data.user.role === 'moderator') {
  navigate('/moderator', { replace: true });
} else {
  navigate('/', { replace: true });
}
  };
  // ── Register ───────────────────────────────────────────────────────────────
  // The register API only returns { message, user: { email } } — no token.
  // We store a minimal user so the verify-notice page can show the email,
  // but we do NOT set a real session token.
  const register = async (email, password, phoneNumber) => {
    const { data } = await axios.post('/api/auth/register', {
      email,
      password,
      phoneNumber,
    });

    // Store minimal user info so VerifyNotice can display the email
    setUser({ email: data.user?.email || email, isEmailVerified: false });

    navigate('/verify-notice', { replace: true });
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // ── Mark email verified (called from VerifyEmail page after success) ───────
  const markEmailVerified = useCallback(() => {
    setUser(prev => prev ? { ...prev, isEmailVerified: true } : prev);
  }, []);

  // ── Refresh user from API ──────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data);
    } catch {
      // silently fail
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        markEmailVerified,
        refreshUser,
        isAuthenticated: !!user && !!token,
        isEmailVerified: !!user?.isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

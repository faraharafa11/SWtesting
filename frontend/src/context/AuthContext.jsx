import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { fetchProfile } from '../services/api';

export const AuthContext = createContext(undefined);

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem('auth_session');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse stored session', error);
    return null;
  }
};

const persistSession = (session) => {
  if (session?.token) {
    localStorage.setItem('auth_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('auth_session');
  }
};

export function AuthProvider({ children }) {
  const stored = getStoredSession();
  const [token, setToken] = useState(stored?.token || null);
  const [user, setUser] = useState(stored?.user || null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(stored?.token));

  useEffect(() => {
    if (!isBootstrapping) return;

    let active = true;
    async function hydrateSession() {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const profile = await fetchProfile(token);
        if (active) {
          setUser(profile?.user || profile || null);
          persistSession({ token, user: profile?.user || profile || null });
        }
      } catch (error) {
        console.warn('Session validation failed', error);
        if (active) {
          setToken(null);
          setUser(null);
          persistSession(null);
        }
      } finally {
        if (active) setIsBootstrapping(false);
      }
    }

    hydrateSession();
    return () => {
      active = false;
    };
  }, [token, isBootstrapping]);

  const login = useCallback((payload) => {
    const nextUser = payload?.user || null;
    const nextToken = payload?.token || null;
    setUser(nextUser);
    setToken(nextToken);
    persistSession(nextToken ? { user: nextUser, token: nextToken } : null);
    setIsBootstrapping(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    persistSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading: isBootstrapping,
      login,
      logout
    }),
    [user, token, isBootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

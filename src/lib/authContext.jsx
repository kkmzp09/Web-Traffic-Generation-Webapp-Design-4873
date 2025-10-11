import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginRequest, meRequest } from './authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawSession = localStorage.getItem('tg_session');
    if (!rawSession) {
      setLoading(false);
      return;
    }

    try {
      const session = JSON.parse(rawSession);
      if (session?.token) {
        setToken(session.token);
        // Verify session on load
        meRequest(session.token)
          .then((me) => {
            setUser({ ...me });
            setIsAuthenticated(true);
          })
          .catch(() => {
            // Token is invalid, clear session
            localStorage.removeItem('tg_session');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch {
      // Corrupted session data
      localStorage.removeItem('tg_session');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await loginRequest(email, password);
    const session = {
      token: response.accessToken,
      user: response.user,
    };
    localStorage.setItem('tg_session', JSON.stringify(session));
    setToken(response.accessToken);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('tg_session');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
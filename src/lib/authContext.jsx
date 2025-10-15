// src/lib/authContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logout as authLogout, getStoredSession } from './auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredSession()?.user || null);
  const [loading, setLoading] = useState(true);

  // modal state centralized here so App/Header/AuthModal can coordinate
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    (async () => {
      try {
        const current = await getCurrentUser();
        setUser(current);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser } = await loginUser(email, password);
    setUser(loggedInUser);
    setAuthModalOpen(false);
    return loggedInUser;
  };

  const register = async (userData) => {
    return registerUser(userData);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,

    login,
    register,
    logout,

    // modal controls
    isAuthModalOpen,
    authMode,
    openAuthModal: (mode = 'login') => { setAuthMode(mode); setAuthModalOpen(true); },
    closeAuthModal: () => setAuthModalOpen(false),
    setAuthMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
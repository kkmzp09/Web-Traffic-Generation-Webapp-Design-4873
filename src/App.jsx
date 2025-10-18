// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthModal from './components/AuthModal';

// Pages
import Dashboard from './components/Dashboard';
import DirectTraffic from './components/DirectTraffic';
import SeoTraffic from './components/SeoTraffic';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import QuickStart from './components/QuickStart';
import LoginPage from './pages/LoginPage.jsx';

// --- Auth gate that matches your current context (user + loading) ---
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center p-10">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

// --- Layout with Sidebar + Header ---
function MainLayout({ onAuthClick }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Header onAuthClick={onAuthClick} />
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// --- Inner app lives inside AuthProvider so it can use useAuth() ---
function AppShell() {
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  // We manage the login/register mode locally here (context doesn’t provide it)
  const [authMode, setAuthMode] = useState('login');

  const handleAuthClick = (mode) => {
    setAuthMode(mode || 'login');
    openAuthModal(); // context already has this; no signature changes
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage onAuthClick={handleAuthClick} />} />

        <Route element={<MainLayout onAuthClick={handleAuthClick} />}>
          <Route path="/quick-start" element={<QuickStart />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/direct-traffic" element={<RequireAuth><DirectTraffic /></RequireAuth>} />
          <Route path="/seo-traffic" element={<RequireAuth><SeoTraffic /></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modal controlled by context (open/close) + local mode state */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}
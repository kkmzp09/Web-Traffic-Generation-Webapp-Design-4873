// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';
import { SubscriptionProvider } from './lib/subscriptionContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import SubscriptionGuard from './components/SubscriptionGuard';

// Pages
import Dashboard from './components/Dashboard';
import DirectTraffic from './components/DirectTraffic';
import SeoTraffic from './components/SeoTraffic';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import QuickStart from './components/QuickStart';
import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import CryptoPaymentPage from './pages/CryptoPaymentPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import Invoice from './components/Invoice';
import DomainAnalytics from './components/DomainAnalytics';
import KeywordTracker from './components/KeywordTracker';
import OnPageSEO from './components/OnPageSEO';
import SEODashboard from './components/SEODashboard';
import SEOScanResults from './components/SEOScanResults';
import GSCAnalytics from './components/GSCAnalytics';
import WidgetInstallation from './components/WidgetInstallation';
import PricingPlans from './components/PricingPlans';

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
        {/* Public Landing Page - Now the default homepage */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPlans />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/crypto-payment" element={<CryptoPaymentPage />} />
        
        <Route path="/login" element={<LoginPage onAuthClick={handleAuthClick} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<MainLayout onAuthClick={handleAuthClick} />}>
          <Route path="/quick-start" element={<QuickStart />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/direct-traffic" element={<RequireAuth><SubscriptionGuard><DirectTraffic /></SubscriptionGuard></RequireAuth>} />
          <Route path="/seo-traffic" element={<RequireAuth><SubscriptionGuard><SeoTraffic /></SubscriptionGuard></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="/domain-analytics" element={<RequireAuth><DomainAnalytics /></RequireAuth>} />
          <Route path="/keyword-tracker" element={<RequireAuth><KeywordTracker /></RequireAuth>} />
          <Route path="/onpage-seo" element={<RequireAuth><OnPageSEO /></RequireAuth>} />
          <Route path="/gsc-analytics" element={<RequireAuth><GSCAnalytics /></RequireAuth>} />
          <Route path="/seo-dashboard" element={<RequireAuth><SEODashboard /></RequireAuth>} />
          <Route path="/seo-scan/:scanId" element={<RequireAuth><SEOScanResults /></RequireAuth>} />
          <Route path="/widget-installation" element={<RequireAuth><WidgetInstallation /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/invoice" element={<RequireAuth><Invoice /></RequireAuth>} />
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
        <SubscriptionProvider>
          <AppShell />
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}
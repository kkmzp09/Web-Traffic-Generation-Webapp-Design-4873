import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';

import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import DirectTraffic from './components/DirectTraffic';
import SeoTraffic from './components/SeoTraffic';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import QuickStart from './components/QuickStart';
import RunCampaign from './components/RunCampaign';

// Route guard for authenticated users
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can render a loading spinner here if you want
    return <div className="flex items-center justify-center h-screen"><p>Loading session...</p></div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

// Route guard for admin users
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading session...</p></div>;
  }

  return (isAuthenticated && isAdmin) ? children : <Navigate to="/" replace />;
}

// The main application layout
function AppLayout() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
      // If not authenticated, AuthModal will be shown by the AuthProvider logic.
      // We render a minimal layout, or nothing, while the modal is active.
      return <AuthModal />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/direct-traffic" element={<DirectTraffic />} />
          <Route path="/seo-traffic" element={<SeoTraffic />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/quick-start" element={<QuickStart />} />
          <Route path="/run-campaign" element={<RunCampaign />} />
          {/* Example of an admin-only route */}
          {/* <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><p className="text-lg text-gray-600">Initializing Application...</p></div>;
    }

    return isAuthenticated ? <AppLayout /> : <AuthModal />;
}

export default App;
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';

import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';

// Pages
import Dashboard from './components/Dashboard';
import DirectTraffic from './components/DirectTraffic';
import SeoTraffic from './components/SeoTraffic';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import QuickStart from './components/QuickStart';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex bg-gray-100 min-h-screen">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/direct-traffic" element={<DirectTraffic />} />
              <Route path="/seo-traffic" element={<SeoTraffic />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/quick-start" element={<QuickStart />} />
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Keep modal mounted inside Router + Provider */}
        <AuthModal />
      </AuthProvider>
    </Router>
  );
}

export default App;
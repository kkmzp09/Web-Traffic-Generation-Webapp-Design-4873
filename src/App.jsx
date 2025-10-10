import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import DirectTraffic from './components/DirectTraffic';
import SeoTraffic from './components/SeoTraffic';
import Settings from './components/Settings';
import Invoice from './components/Invoice';
import { useAuth } from './lib/authContext';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Show sidebar only when authenticated */}
        {isAuthenticated && <Sidebar />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Show header only when authenticated */}
          {isAuthenticated && <Header />}
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              {/* Public route - login/register page */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} 
              />
              
              {/* Protected routes - only accessible when authenticated */}
              {isAuthenticated ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/direct-traffic" element={<DirectTraffic />} />
                  <Route path="/seo-traffic" element={<SeoTraffic />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/invoice" element={<Invoice />} />
                  {/* Redirect any unknown routes to dashboard when authenticated */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              ) : (
                <>
                  {/* Redirect all other routes to home when not authenticated */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
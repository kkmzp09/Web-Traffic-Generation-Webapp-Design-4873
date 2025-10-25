// src/components/Dashboard.jsx
// Main dashboard - now shows SEO Journey as primary interface

import React from 'react';
import SEOJourney from './SEOJourney';
import GSCConnect from './GSCConnect';
import { useAuth } from '../lib/authContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Google Search Console Integration */}
        <div className="mb-8">
          <GSCConnect userId={user?.id} />
        </div>

        {/* SEO Journey - Main Interface */}
        <SEOJourney />
      </div>
    </div>
  );
};

export default Dashboard;

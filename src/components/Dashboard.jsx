// src/components/Dashboard.jsx
// Main dashboard - now shows SEO Journey as primary interface

import React from 'react';
import SEOJourney from './SEOJourney';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* SEO Journey - Main Interface */}
        <SEOJourney />
      </div>
    </div>
  );
};

export default Dashboard;

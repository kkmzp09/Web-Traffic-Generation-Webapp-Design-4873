import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiClock, FiZap, FiRefreshCw } = FiIcons;

export default function SEODashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanUrl, setScanUrl] = useState('');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/dashboard-stats?userId=${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentScans(data.recentScans);
        setTopIssues(data.topIssues);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    if (!scanUrl.trim()) {
      alert('Please enter a URL to scan');
      return;
    }

    try {
      setScanning(true);
      const response = await fetch('https://api.organitrafficboost.com/api/seo/scan-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scanUrl,
          userId: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Scan started! Check results in a few moments.');
        setScanUrl('');
        setTimeout(loadDashboardData, 3000);
      } else {
        alert('Scan failed: ' + data.error);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to start scan');
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Automation Dashboard</h1>
          <p className="text-gray-600">Scan, analyze, and optimize your pages with AI-powered fixes</p>
        </div>

        {/* Quick Scan */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-indigo-100">
          <div className="flex items-center gap-4">
            <FiSearch className="w-6 h-6 text-indigo-600" />
            <input
              type="url"
              placeholder="Enter URL to scan (e.g., https://example.com)"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={scanning}
            />
            <button
              onClick={startScan}
              disabled={scanning}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all"
            >
              {scanning ? (
                <>
                  <FiRefreshCw className="w-5 h-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FiZap className="w-5 h-5" />
                  Scan Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FiSearch className="w-8 h-8" />}
            title="Pages Scanned"
            value={stats?.total_pages_scanned || 0}
            color="indigo"
          />
          <StatCard
            icon={<FiAlertCircle className="w-8 h-8" />}
            title="Critical Issues"
            value={stats?.total_critical_issues || 0}
            color="red"
          />
          <StatCard
            icon={<FiCheckCircle className="w-8 h-8" />}
            title="Avg SEO Score"
            value={Math.round(stats?.avg_seo_score || 0)}
            color="green"
          />
          <StatCard
            icon={<FiTrendingUp className="w-8 h-8" />}
            title="Domains"
            value={stats?.total_domains || 0}
            color="purple"
          />
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Scans</h2>
            <button
              onClick={loadDashboardData}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No scans yet. Start your first scan above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} getScoreColor={getScoreColor} getScoreBg={getScoreBg} navigate={navigate} />
              ))}
            </div>
          )}
        </div>

        {/* Top Issues */}
        {topIssues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Issues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topIssues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`w-16 h-16 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ScanCard({ scan, getScoreColor, getScoreBg, navigate }) {
  return (
    <div 
      onClick={() => navigate(`/seo-scan/${scan.id}`)}
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{scan.url}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {new Date(scan.scanned_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4 text-red-500" />
              {scan.critical_issues} Critical
            </span>
            <span className="text-yellow-600">{scan.warnings} Warnings</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg ${getScoreBg(scan.seo_score)}`}>
          <span className={`text-2xl font-bold ${getScoreColor(scan.seo_score)}`}>
            {scan.seo_score}
          </span>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue }) {
  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div className={`border rounded-lg p-4 ${severityColors[issue.severity]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold capitalize">{issue.category}</span>
        <span className="text-2xl font-bold">{issue.count}</span>
      </div>
      <span className="text-xs uppercase font-medium">{issue.severity}</span>
    </div>
  );
}

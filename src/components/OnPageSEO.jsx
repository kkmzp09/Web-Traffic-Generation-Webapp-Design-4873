// src/components/OnPageSEO.jsx
// On-Page SEO Analyzer with actionable recommendations

import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiCheckCircle, FiAlertCircle, FiXCircle, FiSearch, FiLoader,
  FiFileText, FiImage, FiLink, FiCode, FiZap, FiDownload
} = FiIcons;

const OnPageSEO = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const analyzePage = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      
      // Start the scan
      const response = await fetch(`${apiBase}/api/seo/scan-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          userId: '00000000-0000-0000-0000-000000000000'
        })
      });

      const data = await response.json();

      if (data.success && data.scanId) {
        // Poll for scan completion
        const scanId = data.scanId;
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max
        
        const pollInterval = setInterval(async () => {
          attempts++;
          
          try {
            const scanResponse = await fetch(`${apiBase}/api/seo/scan/${scanId}`);
            const scanData = await scanResponse.json();
            
            if (scanData.success && scanData.scan.status === 'completed') {
              clearInterval(pollInterval);
              setAnalysis({
                score: scanData.scan.seo_score,
                issues: scanData.issues || [],
                url: scanData.scan.url
              });
              setLoading(false);
            } else if (scanData.scan.status === 'failed' || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setError('Scan failed or timed out');
              setLoading(false);
            }
          } catch (pollErr) {
            console.error('Poll error:', pollErr);
          }
        }, 1000);
      } else {
        setError(data.error || 'Failed to start scan');
      }
    } catch (err) {
      console.error('Analysis Error:', err);
      setError('Failed to analyze page. Please try again.');
      setLoading(false);
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

  const exportReport = () => {
    if (!analysis) return;

    const report = `
SEO Analysis Report
===================
URL: ${url}
Date: ${new Date().toLocaleString()}
Overall Score: ${analysis.score}/100

${analysis.issues.map(issue => `
${issue.severity.toUpperCase()}: ${issue.title}
${issue.description}
Fix: ${issue.fix}
`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo-report-${new Date().getTime()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
            <SafeIcon icon={FiCheckCircle} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">On-Page SEO Analyzer</h1>
            <p className="text-gray-600 mt-1">
              Analyze and optimize your web pages for better search rankings
            </p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="Enter page URL (e.g., https://example.com/page)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzePage()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={analyzePage}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <SafeIcon icon={loading ? FiLoader : FiSearch} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Overall Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall SEO Score</h2>
                <p className="text-sm text-gray-600">Based on {analysis.checks_performed} checks</p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-sm text-gray-600 mt-1">out of 100</div>
              </div>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Issues Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <SafeIcon icon={FiXCircle} className="w-6 h-6 text-red-600" />
                <h3 className="font-semibold text-gray-900">Critical Issues</h3>
              </div>
              <div className="text-3xl font-bold text-red-600">{analysis.critical || 0}</div>
              <p className="text-sm text-gray-600 mt-1">Must fix immediately</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Warnings</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{analysis.warnings || 0}</div>
              <p className="text-sm text-gray-600 mt-1">Should be addressed</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <SafeIcon icon={FiCheckCircle} className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Passed</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">{analysis.passed || 0}</div>
              <p className="text-sm text-gray-600 mt-1">Working correctly</p>
            </div>
          </div>

          {/* Detailed Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Detailed Analysis & Recommendations</h2>
            <div className="space-y-4">
              {analysis.issues && analysis.issues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Features Info */}
      {!analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={FiFileText}
            title="Content Analysis"
            description="Title tags, meta descriptions, headings, and content quality"
          />
          <FeatureCard
            icon={FiImage}
            title="Image Optimization"
            description="Alt tags, file sizes, and image SEO best practices"
          />
          <FeatureCard
            icon={FiLink}
            title="Link Structure"
            description="Internal links, external links, and anchor text analysis"
          />
          <FeatureCard
            icon={FiCode}
            title="Technical SEO"
            description="Schema markup, canonical tags, and page speed"
          />
        </div>
      )}
    </div>
  );
};

// Issue Card Component
const IssueCard = ({ issue }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return FiXCircle;
      case 'warning': return FiAlertCircle;
      case 'passed': return FiCheckCircle;
      default: return FiAlertCircle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'passed': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
      <div className="flex items-start gap-3">
        <SafeIcon icon={getSeverityIcon(issue.severity)} className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{issue.title}</h3>
          <p className="text-sm mb-2">{issue.description}</p>
          {issue.fix && (
            <div className="mt-2 p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-1">
                <SafeIcon icon={FiZap} className="w-4 h-4" />
                <span className="text-sm font-medium">How to Fix:</span>
              </div>
              <p className="text-sm">{issue.fix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <SafeIcon icon={icon} className="w-8 h-8 text-purple-600 mb-3" />
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default OnPageSEO;

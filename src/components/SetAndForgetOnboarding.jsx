import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiZap, FiCheck, FiArrowRight, FiGlobe, FiMail, FiTrendingUp, FiSettings } = FiIcons;

export default function SetAndForgetOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    websiteUrl: '',
    email: user?.email || '',
    keywords: [],
    autoFixEnabled: true,
    scanFrequency: 'weekly',
    emailReports: true,
    widgetInstalled: false
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addKeyword = () => {
    if (keywordInput.trim() && config.keywords.length < 5) {
      setConfig({
        ...config,
        keywords: [...config.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setConfig({
      ...config,
      keywords: config.keywords.filter(k => k !== keyword)
    });
  };

  const completeSetup = async () => {
    setLoading(true);
    
    try {
      // 1. Enable automated monitoring
      await fetch('https://api.organitrafficboost.com/api/seo/monitoring-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          websiteUrl: config.websiteUrl,
          monitoringEnabled: true,
          autoFixEnabled: config.autoFixEnabled,
          scanFrequency: config.scanFrequency,
          emailNotifications: config.emailReports,
          targetKeywords: config.keywords
        })
      });

      // 2. Run initial scan
      const scanResponse = await fetch('https://api.organitrafficboost.com/api/seo/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          url: config.websiteUrl,
          userId: user.id
        })
      });

      const scanData = await scanResponse.json();

      // 3. Wait for scan to complete and auto-apply fixes
      setTimeout(async () => {
        // Auto-apply all fixes
        await fetch(`https://api.organitrafficboost.com/api/seo/auto-fix-all/${scanData.scanId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        // 4. Send welcome email
        await fetch('https://api.organitrafficboost.com/api/seo/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            email: config.email,
            websiteUrl: config.websiteUrl,
            scanId: scanData.scanId
          })
        });

        // Navigate to dashboard
        navigate('/seo-dashboard');
      }, 35000); // Wait 35 seconds for scan

    } catch (error) {
      console.error('Setup error:', error);
      alert('Setup failed. Please try again.');
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enter Your Website
              </h2>
              <p className="text-gray-600">
                We'll automatically monitor and optimize your SEO
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={config.websiteUrl}
                onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email for Reports
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!config.websiteUrl || !config.email}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-lg"
            >
              Continue
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Target Keywords
              </h2>
              <p className="text-gray-600">
                Add up to 5 keywords to track rankings (optional)
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="e.g., web design services"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={config.keywords.length >= 5}
              />
              <button
                onClick={addKeyword}
                disabled={!keywordInput.trim() || config.keywords.length >= 5}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {config.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-indigo-900 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              {config.keywords.length === 0 && (
                <p className="text-gray-400 italic py-2">No keywords added yet (optional)</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-lg"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 font-bold text-lg"
              >
                Continue
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSettings className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Automation Settings
              </h2>
              <p className="text-gray-600">
                Configure how often we monitor and optimize
              </p>
            </div>

            <div className="space-y-4">
              {/* Auto-Fix Toggle */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                      <FiZap className="w-5 h-5 text-green-600" />
                      Auto-Fix Issues
                    </div>
                    <div className="text-sm text-gray-600">
                      Automatically fix SEO issues via widget (recommended)
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={config.autoFixEnabled}
                      onChange={(e) => setConfig({ ...config, autoFixEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                </label>
              </div>

              {/* Scan Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan Frequency
                </label>
                <select
                  value={config.scanFrequency}
                  onChange={(e) => setConfig({ ...config, scanFrequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="daily">Daily (Best for active sites)</option>
                  <option value="weekly">Weekly (Recommended)</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Email Reports */}
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.emailReports}
                    onChange={(e) => setConfig({ ...config, emailReports: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      Email Reports
                    </div>
                    <div className="text-sm text-gray-600">
                      Receive detailed reports after each scan
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-lg"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 font-bold text-lg"
              >
                Review Setup
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ready to Launch!
              </h2>
              <p className="text-gray-600">
                Review your settings and activate automation
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-indigo-200">
                <span className="text-gray-600">Website</span>
                <span className="font-semibold text-gray-900">{config.websiteUrl}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-indigo-200">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-900">{config.email}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-indigo-200">
                <span className="text-gray-600">Keywords</span>
                <span className="font-semibold text-gray-900">
                  {config.keywords.length > 0 ? `${config.keywords.length} keywords` : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-indigo-200">
                <span className="text-gray-600">Auto-Fix</span>
                <span className={`font-semibold ${config.autoFixEnabled ? 'text-green-600' : 'text-gray-900'}`}>
                  {config.autoFixEnabled ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-indigo-200">
                <span className="text-gray-600">Scan Frequency</span>
                <span className="font-semibold text-gray-900 capitalize">{config.scanFrequency}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Email Reports</span>
                <span className={`font-semibold ${config.emailReports ? 'text-green-600' : 'text-gray-900'}`}>
                  {config.emailReports ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-green-900 mb-3 text-lg">
                🚀 What Happens Next:
              </h3>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Initial SEO scan runs immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>All fixable issues are auto-fixed via widget</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>You receive a welcome email with results</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Automated {config.scanFrequency} scans begin</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Rankings tracked and reported automatically</span>
                </li>
              </ul>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Setting Up Your Automation...
                </h3>
                <p className="text-gray-600">
                  Running initial scan and applying fixes
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This will take about 30 seconds
                </p>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-lg"
                >
                  Back
                </button>
                <button
                  onClick={completeSetup}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
                >
                  <FiZap className="w-6 h-6" />
                  Activate Automation
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  s <= step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {s < step ? <FiCheck className="w-6 h-6" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-indigo-100">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Step {step} of 4 • Set and Forget SEO Automation
        </div>
      </div>
    </div>
  );
}

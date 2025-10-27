import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiZap, FiClock, FiMail, FiTrendingUp, FiCheckCircle, FiSettings, FiSave } = FiIcons;

export default function AutomatedMonitoringSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    monitoringEnabled: false,
    autoFixEnabled: false,
    scanFrequency: 'weekly',
    emailNotifications: true,
    targetKeywords: [],
    competitorUrls: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(
        `https://api.organitrafficboost.com/api/seo/monitoring-settings`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        'https://api.organitrafficboost.com/api/seo/monitoring-settings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(settings)
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('✅ Settings saved successfully!');
      } else {
        alert('Failed to save settings: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !settings.targetKeywords.includes(keywordInput.trim())) {
      setSettings({
        ...settings,
        targetKeywords: [...settings.targetKeywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setSettings({
      ...settings,
      targetKeywords: settings.targetKeywords.filter(k => k !== keyword)
    });
  };

  const addCompetitor = () => {
    if (competitorInput.trim() && !settings.competitorUrls.includes(competitorInput.trim())) {
      setSettings({
        ...settings,
        competitorUrls: [...settings.competitorUrls, competitorInput.trim()]
      });
      setCompetitorInput('');
    }
  };

  const removeCompetitor = (url) => {
    setSettings({
      ...settings,
      competitorUrls: settings.competitorUrls.filter(u => u !== url)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiSettings className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 Automated SEO Monitoring
          </h1>
          <p className="text-gray-600">
            Set up automated scans, competitor analysis, and auto-fix with email reports
          </p>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FiSettings className="w-6 h-6" />
            Monitoring Settings
          </h2>

          {/* Enable Monitoring */}
          <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-lg text-gray-900 mb-1">
                  Enable Automated Monitoring
                </div>
                <div className="text-sm text-gray-600">
                  Automatically scan your website on a regular schedule
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.monitoringEnabled}
                  onChange={(e) => setSettings({ ...settings, monitoringEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
            </label>
          </div>

          {/* Auto-Fix */}
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                  <FiZap className="w-5 h-5 text-green-600" />
                  Enable Auto-Fix
                </div>
                <div className="text-sm text-gray-600">
                  Automatically apply widget-based fixes when issues are detected
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.autoFixEnabled}
                  onChange={(e) => setSettings({ ...settings, autoFixEnabled: e.target.checked })}
                  className="sr-only peer"
                  disabled={!settings.monitoringEnabled}
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600 disabled:opacity-50"></div>
              </div>
            </label>
          </div>

          {/* Scan Frequency */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              Scan Frequency
            </label>
            <select
              value={settings.scanFrequency}
              onChange={(e) => setSettings({ ...settings, scanFrequency: e.target.value })}
              disabled={!settings.monitoringEnabled}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Email Notifications */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                disabled={!settings.monitoringEnabled}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  Email Notifications
                </div>
                <div className="text-sm text-gray-600">
                  Receive detailed reports after each scan
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Target Keywords */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-6 h-6" />
            Target Keywords
          </h2>
          <p className="text-gray-600 mb-4">
            Track rankings and analyze competitors for these keywords
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Enter keyword (e.g., 'web design services')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={addKeyword}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.targetKeywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-indigo-900"
                >
                  ×
                </button>
              </div>
            ))}
            {settings.targetKeywords.length === 0 && (
              <p className="text-gray-400 italic">No keywords added yet</p>
            )}
          </div>
        </div>

        {/* Competitor URLs */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Competitor Websites
          </h2>
          <p className="text-gray-600 mb-4">
            Monitor and compare your SEO performance against competitors
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
              placeholder="Enter competitor URL (e.g., https://competitor.com)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={addCompetitor}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {settings.competitorUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-gray-700">{url}</span>
                <button
                  onClick={() => removeCompetitor(url)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            {settings.competitorUrls.length === 0 && (
              <p className="text-gray-400 italic">No competitors added yet</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 font-bold text-lg shadow-lg"
          >
            {saving ? (
              <>
                <FiSettings className="w-6 h-6 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-6 h-6" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        {settings.monitoringEnabled && (
          <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">
                  ✅ Automated Monitoring Active
                </h3>
                <p className="text-green-800 text-sm mb-2">
                  Your website will be automatically scanned <strong>{settings.scanFrequency}</strong>.
                </p>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• SEO issues will be detected automatically</li>
                  {settings.autoFixEnabled && <li>• Fixes will be applied via widget instantly</li>}
                  {settings.emailNotifications && <li>• Email reports will be sent after each scan</li>}
                  {settings.targetKeywords.length > 0 && <li>• Rankings tracked for {settings.targetKeywords.length} keyword(s)</li>}
                  {settings.competitorUrls.length > 0 && <li>• Comparing against {settings.competitorUrls.length} competitor(s)</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

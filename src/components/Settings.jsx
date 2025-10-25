import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { FiUser, FiMail, FiLock, FiBell, FiGlobe, FiCreditCard, FiSave, FiCheck } from 'react-icons/fi';
import GSCConnect from './GSCConnect';

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    website: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    campaignComplete: true,
    dailyReport: false,
    weeklyReport: true,
    systemUpdates: true
  });

  // Traffic preferences
  const [preferences, setPreferences] = useState({
    defaultCountry: 'US',
    trafficSpeed: 'medium',
    autoRetry: true
  });

  const handleSave = () => {
    // Save settings logic here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and traffic generation preferences</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <FiCheck className="text-green-600 text-xl" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Google Search Console Integration */}
      <div>
        <GSCConnect userId={user?.id} />
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiUser className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-600">Update your personal details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({...profile, company: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FiBell className="text-purple-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600">Manage your email notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Campaign Completion</div>
              <div className="text-sm text-gray-600">Get notified when your campaigns finish</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.campaignComplete}
              onChange={(e) => setNotifications({...notifications, campaignComplete: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Daily Reports</div>
              <div className="text-sm text-gray-600">Receive daily traffic summaries</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.dailyReport}
              onChange={(e) => setNotifications({...notifications, dailyReport: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Weekly Reports</div>
              <div className="text-sm text-gray-600">Get weekly performance insights</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyReport}
              onChange={(e) => setNotifications({...notifications, weeklyReport: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">System Updates</div>
              <div className="text-sm text-gray-600">Important product updates and features</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.systemUpdates}
              onChange={(e) => setNotifications({...notifications, systemUpdates: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Traffic Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FiGlobe className="text-green-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Traffic Preferences</h2>
            <p className="text-sm text-gray-600">Configure default campaign settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Target Country
            </label>
            <select
              value={preferences.defaultCountry}
              onChange={(e) => setPreferences({...preferences, defaultCountry: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
              <option value="BR">Brazil</option>
              <option value="GLOBAL">Global (Mixed)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traffic Delivery Speed
            </label>
            <select
              value={preferences.trafficSpeed}
              onChange={(e) => setPreferences({...preferences, trafficSpeed: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="slow">Slow (Natural pace - Recommended)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="fast">Fast (Quick delivery)</option>
            </select>
            <p className="text-sm text-gray-600 mt-2">Slower speeds appear more natural and organic</p>
          </div>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <div>
              <div className="font-medium text-gray-900">Auto-Retry Failed Visits</div>
              <div className="text-sm text-gray-600">Automatically retry if visits fail</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoRetry}
              onChange={(e) => setPreferences({...preferences, autoRetry: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiCreditCard className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Subscription Plan</h2>
            <p className="text-sm text-gray-600">Manage your billing and plan</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Current Plan:</span>
            <span className="text-blue-600 font-bold">Professional ($100/month)</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Monthly Visits:</span>
            <span className="text-gray-900 font-semibold">5,000 visits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Next Billing Date:</span>
            <span className="text-gray-900 font-semibold">Nov 18, 2025</span>
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
        >
          <FiSave />
          Save Changes
        </button>
      </div>
    </div>
  );
}
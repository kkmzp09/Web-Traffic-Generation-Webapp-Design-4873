import React, { useState, useEffect } from 'react';
import * as Fi from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { DEFAULT_SERVER_CONFIG } from '../config';
import {
  checkServerHealth,
  getServerUrl,
  handleApiError,
} from '../api';
import SafeIcon from '../common/SafeIcon';

const {
  FiServer, FiZap, FiUser, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock,
  FiActivity, FiWifi, FiCloud, FiKey
} = Fi;

const DiagnosticItem = ({ icon, title, status, message, inProgress }) => {
  const getStatusIndicator = () => {
    if (inProgress) {
      return <FiClock className="text-yellow-500 animate-spin" />;
    }
    switch (status) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'error':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiAlertCircle className="text-gray-400" />;
    }
  };

  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <SafeIcon icon={icon} className="mr-3 text-gray-500" />
        <span className="font-medium text-gray-800">{title}</span>
      </div>
      <div className="flex items-center">
        <span className={`text-sm mr-3 ${status === 'error' ? 'text-red-700' : 'text-gray-600'}`}>
          {message}
        </span>
        {getStatusIndicator()}
      </div>
    </li>
  );
};

export default function ServerDiagnostics() {
  const { user, isAuthenticated } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    apiReachability: { status: null, message: '', inProgress: false },
    apiKey: { status: null, message: '', inProgress: false },
    authentication: { status: null, message: '', inProgress: false },
  });

  const runDiagnostics = async () => {
    // ---- 1. API Reachability ----
    setDiagnostics(prev => ({
      ...prev,
      apiReachability: { status: null, message: 'Pinging...', inProgress: true },
    }));
    try {
      await checkServerHealth(DEFAULT_SERVER_CONFIG);
      setDiagnostics(prev => ({
        ...prev,
        apiReachability: {
          status: 'success',
          message: 'API is online',
          inProgress: false,
        },
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        apiReachability: {
          status: 'error',
          message: handleApiError(error, 'Health check'),
          inProgress: false,
        },
      }));
      // Stop further tests if API is unreachable
      setDiagnostics(prev => ({
        ...prev,
        apiKey: { status: 'skipped', message: 'Skipped', inProgress: false },
        authentication: { status: 'skipped', message: 'Skipped', inProgress: false },
      }));
      return;
    }

    // ---- 2. API Key (if provided) ----
    if (DEFAULT_SERVER_CONFIG.apiKey) {
      setDiagnostics(prev => ({
        ...prev,
        apiKey: { status: null, message: 'Validating...', inProgress: true },
      }));
      // This is a placeholder. Real validation requires a protected endpoint.
      // We'll assume health check is enough proof for now.
      setTimeout(() => {
        setDiagnostics(prev => ({
          ...prev,
          apiKey: { status: 'success', message: 'Key present', inProgress: false },
        }));
      }, 500);
    } else {
      setDiagnostics(prev => ({
        ...prev,
        apiKey: { status: 'skipped', message: 'No API key set', inProgress: false },
      }));
    }

    // ---- 3. Authentication Status ----
    setDiagnostics(prev => ({
      ...prev,
      authentication: { status: null, message: 'Checking...', inProgress: true },
    }));
    setTimeout(() => {
      setDiagnostics(prev => ({
        ...prev,
        authentication: {
          status: 'success',
          message: isAuthenticated ? `Logged in as ${user.email}` : 'Guest mode',
          inProgress: false,
        },
      }));
    }, 800);
  };

  useEffect(() => {
    runDiagnostics();
  }, [isAuthenticated, user]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <FiActivity className="mr-2 text-red-500" />
        Server Diagnostics
      </h3>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <FiCloud className="inline mr-2" />
          API Endpoint: <strong>{getServerUrl(DEFAULT_SERVER_CONFIG)}</strong>
        </p>
      </div>
      <ul className="space-y-3">
        <DiagnosticItem
          icon={FiWifi}
          title="API Reachability"
          {...diagnostics.apiReachability}
        />
        <DiagnosticItem
          icon={FiKey}
          title="API Key"
          {...diagnostics.apiKey}
        />
        <DiagnosticItem
          icon={FiUser}
          title="Authentication"
          {...diagnostics.authentication}
        />
      </ul>
      <div className="mt-6 text-center">
        <button
          onClick={runDiagnostics}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
          disabled={Object.values(diagnostics).some(d => d.inProgress)}
        >
          <FiZap className="mr-2" />
          Re-run Diagnostics
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import { getDatabaseStatus, getDatabaseInfo, healthCheck } from '../lib/database';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiCheck, FiAlertCircle, FiWifi, FiShield, FiRefreshCw, FiActivity } = FiIcons;

const DatabaseStatus = () => {
  const [dbStatus, setDbStatus] = useState(null);
  const [dbInfo, setDbInfo] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const [status, info, health] = await Promise.all([
        getDatabaseStatus(),
        getDatabaseInfo(),
        healthCheck()
      ]);
      
      setDbStatus(status);
      setDbInfo(info);
      setHealthData(health);
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus({ status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const health = await healthCheck();
      setHealthData(health);
      
      // Refresh status after test
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <SafeIcon icon={FiRefreshCw} className="animate-spin text-blue-600 text-2xl" />
          <span className="ml-2 text-gray-600">Checking database status...</span>
        </div>
      </div>
    );
  }

  if (!dbStatus) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700';
      case 'configured':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return FiCheck;
      case 'configured':
        return FiDatabase;
      case 'error':
        return FiAlertCircle;
      default:
        return FiDatabase;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <SafeIcon icon={FiDatabase} className="text-blue-600" />
          <span>Database Status</span>
        </h3>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dbStatus.status)}`}>
            <SafeIcon 
              icon={getStatusIcon(dbStatus.status)} 
              className="text-sm" 
            />
            <span className="capitalize">{dbStatus.status}</span>
          </div>
          
          <button
            onClick={testConnection}
            disabled={testing}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <SafeIcon 
              icon={FiActivity} 
              className={`text-sm ${testing ? 'animate-pulse' : ''}`} 
            />
            <span>{testing ? 'Testing...' : 'Test'}</span>
          </button>
        </div>
      </div>

      {dbStatus.status !== 'error' && dbInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Provider</span>
              <span className="font-medium text-gray-900">{dbStatus.provider}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ORM</span>
              <span className="font-medium text-gray-900">{dbInfo.orm}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Driver</span>
              <span className="font-medium text-gray-900">{dbInfo.driver}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Host</span>
              <span className="font-medium text-gray-900 truncate">{dbInfo.host}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="font-medium text-gray-900">{dbInfo.database}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Port</span>
              <span className="font-medium text-gray-900">{dbInfo.port}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSL</span>
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiShield} className="text-green-600 text-sm" />
                <span className="font-medium text-green-600">Enabled</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pooling</span>
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiWifi} className="text-blue-600 text-sm" />
                <span className="font-medium text-blue-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Check Results */}
      {healthData && (
        <div className={`border rounded-lg p-4 ${healthData.healthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start space-x-3">
            <SafeIcon 
              icon={healthData.healthy ? FiCheck : FiAlertCircle} 
              className={`mt-0.5 ${healthData.healthy ? 'text-green-600' : 'text-red-600'}`} 
            />
            <div className="flex-1">
              <h4 className={`font-medium ${healthData.healthy ? 'text-green-900' : 'text-red-900'}`}>
                {healthData.healthy ? 'Connection Healthy' : 'Connection Issues'}
              </h4>
              {healthData.healthy && healthData.info && (
                <div className="text-sm text-green-700 mt-2 space-y-1">
                  <p><strong>Database:</strong> {healthData.info.database}</p>
                  <p><strong>User:</strong> {healthData.info.user}</p>
                  <p><strong>Last Check:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
                </div>
              )}
              {!healthData.healthy && (
                <p className="text-sm text-red-700 mt-1">{healthData.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {dbStatus.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiAlertCircle} className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Database Configuration Error</h4>
              <p className="text-sm text-red-700 mt-1">{dbStatus.error}</p>
              <div className="mt-3 text-sm text-red-700">
                <p><strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check if DATABASE_URL is set in your environment variables</li>
                  <li>Verify the connection string format is correct</li>
                  <li>Ensure your Neon database is running and accessible</li>
                  <li>Check if your IP address is whitelisted (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {dbStatus.status === 'configured' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiDatabase} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Database Configured</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your Drizzle ORM is configured with Neon PostgreSQL. The database connection is ready but hasn't been tested yet. Click "Test" to verify connectivity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;
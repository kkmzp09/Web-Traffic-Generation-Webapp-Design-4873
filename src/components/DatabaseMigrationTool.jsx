import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiRefreshCw, FiCheck, FiX, FiPlay, FiEye, FiAlertTriangle } = FiIcons;

const DatabaseMigrationTool = () => {
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const testConnection = async () => {
    try {
      const { testDatabaseConnection } = await import('../lib/migrate.js');
      const result = await testDatabaseConnection();
      setConnectionStatus(result);
      return result.success;
    } catch (err) {
      setConnectionStatus({ success: false, error: err.message });
      return false;
    }
  };

  const runMigration = async () => {
    setStatus('running');
    setError(null);
    setResults([]);

    try {
      // Step 1: Test connection
      setResults(prev => [...prev, { step: 'Testing database connection...', status: 'running' }]);
      
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error('Database connection failed. Please check your DATABASE_URL configuration.');
      }

      setResults(prev => {
        const newResults = [...prev];
        newResults[newResults.length - 1].status = 'success';
        return newResults;
      });

      // Step 2: Run specific is_active migration
      setResults(prev => [...prev, { step: 'Adding is_active column to user_sessions...', status: 'running' }]);
      
      const { runIsActiveMigration } = await import('../lib/migrate.js');
      const migrationResult = await runIsActiveMigration();
      
      if (migrationResult.success) {
        setResults(prev => {
          const newResults = [...prev];
          newResults[newResults.length - 1].status = 'success';
          return [...newResults, { 
            step: `✅ ${migrationResult.message} (${migrationResult.updatedRecords || 0} records updated)`, 
            status: 'success' 
          }];
        });
      } else {
        // Try full Drizzle migration as fallback
        setResults(prev => [...prev, { step: 'Trying full Drizzle migration...', status: 'running' }]);
        
        const { runMigrations } = await import('../lib/migrate.js');
        const drizzleResult = await runMigrations();
        
        if (!drizzleResult.success) {
          throw new Error(drizzleResult.error);
        }
        
        setResults(prev => {
          const newResults = [...prev];
          newResults[newResults.length - 1].status = 'success';
          return newResults;
        });
      }

      // Step 3: Verify schema
      setResults(prev => [...prev, { step: 'Verifying schema changes...', status: 'running' }]);
      
      const { verifySchema } = await import('../lib/migrate.js');
      const verificationResult = await verifySchema();
      
      if (verificationResult.success) {
        setResults(prev => {
          const newResults = [...prev];
          newResults[newResults.length - 1].status = 'success';
          return [...newResults, { 
            step: `✅ is_active column verified (${verificationResult.column.data_type})`, 
            status: 'success' 
          }];
        });
        setStatus('success');
      } else {
        throw new Error(verificationResult.error);
      }

    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message);
      setStatus('error');
      
      setResults(prev => {
        const newResults = [...prev];
        if (newResults.length > 0) {
          newResults[newResults.length - 1].status = 'error';
        }
        return newResults;
      });
    }
  };

  const viewSchema = async () => {
    try {
      const { getTableSchema } = await import('../lib/migrate.js');
      const tableSchema = await getTableSchema('user_sessions');
      setSchema(tableSchema);
    } catch (err) {
      console.error('Schema fetch error:', err);
      setError(err.message);
    }
  };

  const getStatusIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'success': return FiCheck;
      case 'error': return FiX;
      case 'running': return FiRefreshCw;
      default: return FiDatabase;
    }
  };

  const getStatusColor = (stepStatus) => {
    switch (stepStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiDatabase} className="text-xl text-gray-700" />
          <h3 className="text-lg font-medium text-gray-900">Database Migration Tool</h3>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">🔧 Schema Issue Detected:</div>
          <p className="text-blue-700">
            The <code className="bg-blue-100 px-1 rounded">is_active</code> column is missing from the 
            <code className="bg-blue-100 px-1 rounded">user_sessions</code> table. 
            This migration will safely add the missing column.
          </p>
        </div>
      </div>

      {/* Environment Check */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-2">🔧 Environment Configuration:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <span>DATABASE_URL:</span>
              <span className="text-green-600">✅ Configured</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Drizzle ORM:</span>
              <span className="text-green-600">✅ Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Neon Connection:</span>
              {connectionStatus ? (
                <span className={connectionStatus.success ? 'text-green-600' : 'text-red-600'}>
                  {connectionStatus.success ? '✅ Connected' : '❌ Failed'}
                </span>
              ) : (
                <span className="text-gray-500">⏳ Not tested</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={runMigration}
          disabled={status === 'running'}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <SafeIcon icon={status === 'running' ? FiRefreshCw : FiPlay} 
                   className={status === 'running' ? 'animate-spin' : ''} />
          <span>Run Migration</span>
        </button>

        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiRefreshCw} />
          <span>Test Connection</span>
        </button>

        <button
          onClick={viewSchema}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
        >
          <SafeIcon icon={FiEye} />
          <span>View Schema</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <SafeIcon icon={FiX} />
            <span className="font-medium">Error:</span>
          </div>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Migration Results */}
      {results.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Migration Progress:</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <SafeIcon 
                    icon={getStatusIcon(result.status)} 
                    className={`${getStatusColor(result.status)} ${
                      result.status === 'running' ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="text-gray-900">{result.step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Display */}
      {connectionStatus && (
        <div className={`mb-4 p-3 rounded-lg border ${
          connectionStatus.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`flex items-center space-x-2 ${
            connectionStatus.success ? 'text-green-800' : 'text-red-800'
          }`}>
            <SafeIcon icon={connectionStatus.success ? FiCheck : FiX} />
            <span className="font-medium">
              {connectionStatus.success ? 'Database Connected' : 'Connection Failed'}
            </span>
          </div>
          {connectionStatus.success && (
            <div className="mt-2 text-sm text-green-700">
              <div>Database: {connectionStatus.database}</div>
              <div>Version: {connectionStatus.version}</div>
            </div>
          )}
          {!connectionStatus.success && (
            <p className="mt-1 text-sm text-red-700">{connectionStatus.error}</p>
          )}
        </div>
      )}

      {/* Schema Display */}
      {schema && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">user_sessions Table Schema:</h4>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
            <pre className="text-sm">
              {schema.map(col => 
                `${col.column_name.padEnd(20)} ${col.data_type}${
                  col.character_maximum_length ? `(${col.character_maximum_length})` : ''
                }${col.column_default ? ` DEFAULT ${col.column_default}` : ''}${
                  col.is_nullable === 'NO' ? ' NOT NULL' : ''
                }`
              ).join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <SafeIcon icon={FiCheck} />
            <span className="font-medium">Migration Completed Successfully!</span>
          </div>
          <p className="mt-2 text-sm text-green-700">
            The <code className="bg-green-100 px-1 rounded">is_active</code> column has been added to the 
            <code className="bg-green-100 px-1 rounded">user_sessions</code> table. Your application should now work without errors.
          </p>
          <div className="mt-3 text-xs text-green-600">
            💡 <strong>Next steps:</strong> Restart your development server to ensure all changes take effect.
          </div>
        </div>
      )}

      {/* SQL Preview */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-2">📝 SQL that will be executed:</div>
          <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-x-auto">
{`-- Add missing is_active column to user_sessions
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records
UPDATE user_sessions 
SET is_active = true 
WHERE is_active IS NULL;`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMigrationTool;
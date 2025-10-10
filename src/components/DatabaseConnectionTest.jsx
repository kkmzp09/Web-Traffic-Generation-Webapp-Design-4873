import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import { executeRawSQL, sql, testConnection } from '../lib/database.js';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiCheck, FiX, FiLoader, FiPlay, FiRefreshCw, FiActivity } = FiIcons;

const DatabaseConnectionTest = () => {
  const [testStatus, setTestStatus] = useState({
    isRunning: false,
    results: [],
    error: null,
    connectionInfo: null
  });

  const runSimpleTest = async () => {
    setTestStatus(prev => ({ 
      ...prev, 
      isRunning: true, 
      error: null, 
      results: [] 
    }));

    const results = [];

    try {
      // Test 1: Basic connection test
      results.push({ test: 'Connection Test', status: 'running', result: null });
      setTestStatus(prev => ({ ...prev, results: [...results] }));

      const connectionTest = await testConnection();
      if (connectionTest.connection.status === 'connected') {
        results[results.length - 1] = { 
          test: 'Connection Test', 
          status: 'success', 
          result: `✅ Connected to ${connectionTest.connection.database}` 
        };
      } else {
        results[results.length - 1] = { 
          test: 'Connection Test', 
          status: 'error', 
          result: `❌ ${connectionTest.connection.error}` 
        };
        setTestStatus(prev => ({ ...prev, results: [...results], isRunning: false }));
        return;
      }

      // Test 2: Simple SELECT query
      results.push({ test: 'Basic Query Test', status: 'running', result: null });
      setTestStatus(prev => ({ ...prev, results: [...results] }));

      const basicQuery = await executeRawSQL`SELECT 1 as test_number, 'Hello Database!' as test_message, now() as current_time`;
      results[results.length - 1] = { 
        test: 'Basic Query Test', 
        status: 'success', 
        result: `✅ Query executed successfully. Result: ${basicQuery[0].test_message}` 
      };

      // Test 3: Create and drop a test table
      results.push({ test: 'Table Operations Test', status: 'running', result: null });
      setTestStatus(prev => ({ ...prev, results: [...results] }));

      // Create test table
      await executeRawSQL`
        CREATE TABLE IF NOT EXISTS connection_test_temp (
          id SERIAL PRIMARY KEY,
          test_data TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Insert test data
      await executeRawSQL`
        INSERT INTO connection_test_temp (test_data) 
        VALUES ('Connection test successful at ' || NOW())
      `;

      // Query test data
      const testData = await executeRawSQL`
        SELECT * FROM connection_test_temp ORDER BY created_at DESC LIMIT 1
      `;

      // Clean up test table
      await executeRawSQL`DROP TABLE IF EXISTS connection_test_temp`;

      results[results.length - 1] = { 
        test: 'Table Operations Test', 
        status: 'success', 
        result: `✅ Created table, inserted data, queried result, and cleaned up successfully` 
      };

      // Test 4: Database information query
      results.push({ test: 'Database Info Test', status: 'running', result: null });
      setTestStatus(prev => ({ ...prev, results: [...results] }));

      const dbInfo = await executeRawSQL`
        SELECT 
          current_database() as database_name,
          current_user as current_user,
          version() as postgres_version,
          pg_size_pretty(pg_database_size(current_database())) as database_size
      `;

      results[results.length - 1] = { 
        test: 'Database Info Test', 
        status: 'success', 
        result: `✅ Database: ${dbInfo[0].database_name}, User: ${dbInfo[0].current_user}, Size: ${dbInfo[0].database_size}` 
      };

      // Test 5: Check existing tables
      results.push({ test: 'Schema Check', status: 'running', result: null });
      setTestStatus(prev => ({ ...prev, results: [...results] }));

      const existingTables = await executeRawSQL`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;

      const tableNames = existingTables.map(t => t.table_name);
      results[results.length - 1] = { 
        test: 'Schema Check', 
        status: 'success', 
        result: `✅ Found ${tableNames.length} tables: ${tableNames.join(', ') || 'none'}` 
      };

      setTestStatus(prev => ({ 
        ...prev, 
        results: [...results], 
        isRunning: false,
        connectionInfo: {
          database: dbInfo[0].database_name,
          user: dbInfo[0].current_user,
          version: dbInfo[0].postgres_version.split(' ')[0],
          size: dbInfo[0].database_size,
          tables: tableNames.length
        }
      }));

    } catch (error) {
      console.error('Database test error:', error);
      
      // Update the last running test as failed
      const lastRunningIndex = results.findLastIndex(r => r.status === 'running');
      if (lastRunningIndex !== -1) {
        results[lastRunningIndex] = {
          ...results[lastRunningIndex],
          status: 'error',
          result: `❌ ${error.message}`
        };
      }

      setTestStatus(prev => ({ 
        ...prev, 
        results: [...results], 
        isRunning: false, 
        error: error.message 
      }));
    }
  };

  const clearResults = () => {
    setTestStatus({
      isRunning: false,
      results: [],
      error: null,
      connectionInfo: null
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiActivity} className="text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Database Connection Test</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={runSimpleTest}
            disabled={testStatus.isRunning}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {testStatus.isRunning ? (
              <>
                <SafeIcon icon={FiLoader} className="animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiPlay} />
                <span>Run Test</span>
              </>
            )}
          </button>
          {testStatus.results.length > 0 && (
            <button
              onClick={clearResults}
              disabled={testStatus.isRunning}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <SafeIcon icon={FiRefreshCw} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        This test will verify database connectivity, run basic queries, and check schema information.
      </p>

      {/* Connection Info Summary */}
      {testStatus.connectionInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">Connection Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Database:</span>
              <span className="text-green-600 ml-2">{testStatus.connectionInfo.database}</span>
            </div>
            <div>
              <span className="text-green-700 font-medium">User:</span>
              <span className="text-green-600 ml-2">{testStatus.connectionInfo.user}</span>
            </div>
            <div>
              <span className="text-green-700 font-medium">Version:</span>
              <span className="text-green-600 ml-2">{testStatus.connectionInfo.version}</span>
            </div>
            <div>
              <span className="text-green-700 font-medium">Size:</span>
              <span className="text-green-600 ml-2">{testStatus.connectionInfo.size}</span>
            </div>
            <div className="col-span-2">
              <span className="text-green-700 font-medium">Tables:</span>
              <span className="text-green-600 ml-2">{testStatus.connectionInfo.tables} found</span>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testStatus.results.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Test Results:</h4>
          {testStatus.results.map((result, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {result.status === 'running' && <SafeIcon icon={FiLoader} className="text-blue-600 animate-spin" />}
                {result.status === 'success' && <SafeIcon icon={FiCheck} className="text-green-600" />}
                {result.status === 'error' && <SafeIcon icon={FiX} className="text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{result.test}</p>
                {result.result && (
                  <p className={`text-sm mt-1 ${
                    result.status === 'success' ? 'text-green-700' :
                    result.status === 'error' ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {result.result}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {testStatus.error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiX} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Test Failed</h4>
              <p className="text-sm text-red-700 mt-1">{testStatus.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {testStatus.results.length === 0 && !testStatus.isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiDatabase} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Ready to Test</h4>
              <p className="text-sm text-blue-700 mt-1">
                Click "Run Test" to verify your database connection and run basic operations.
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Test database connectivity</li>
                <li>• Execute basic SQL queries</li>
                <li>• Create and manage test tables</li>
                <li>• Check database schema information</li>
                <li>• Verify table operations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseConnectionTest;
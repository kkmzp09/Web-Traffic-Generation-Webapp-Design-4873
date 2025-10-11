import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { checkTablesExist, testConnection } from '../lib/database.js';
import { registerUser } from '../lib/auth.js';

const { FiPlay, FiCheck, FiX, FiUser, FiDatabase, FiRefreshCw, FiArrowRight } = FiIcons;

const QuickStart = () => {
  const [step, setStep] = useState(1);
  const [dbStatus, setDbStatus] = useState('checking');
  const [connectionTest, setConnectionTest] = useState(null);
  const [testUser, setTestUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    setDbStatus('checking');
    try {
      const tablesExist = await checkTablesExist();
      const connection = await testConnection();
      
      setConnectionTest(connection);
      setDbStatus(tablesExist ? 'ready' : 'not_ready');
      
      if (tablesExist) {
        setStep(2);
      }
    } catch (error) {
      console.error('Database check failed:', error);
      setDbStatus('error');
    }
  };

  const createTestUser = async () => {
    setIsLoading(true);
    try {
      const userData = {
        name: 'Test User',
        email: `test.user.${Date.now()}@example.com`,
        password: 'testpass123'
      };
      
      const user = await registerUser(userData);
      setTestUser({ ...user, password: userData.password });
      setStep(3);
    } catch (error) {
      console.error('Test user creation failed:', error);
      alert('Failed to create test user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Database Connection',
      description: 'Verify Neon database connection and tables',
      status: dbStatus
    },
    {
      id: 2,
      title: 'Test User Creation',
      description: 'Create a test user to verify authentication',
      status: testUser ? 'ready' : 'pending'
    },
    {
      id: 3,
      title: 'Ready to Use',
      description: 'Your application is ready for production',
      status: testUser ? 'ready' : 'pending'
    }
  ];

  const getStepIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'ready': return FiCheck;
      case 'checking': return FiRefreshCw;
      case 'error': return FiX;
      default: return FiPlay;
    }
  };

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'checking': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Start Guide</h2>
          <p className="text-gray-600">Get your Neon + Drizzle application up and running</p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-8">
          {steps.map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(stepItem.status)}`}>
                <SafeIcon 
                  icon={getStepIcon(stepItem.status)} 
                  className={`${stepItem.status === 'checking' ? 'animate-spin' : ''}`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{stepItem.title}</h3>
                <p className="text-gray-600">{stepItem.description}</p>
                
                {/* Step 1 Content */}
                {stepItem.id === 1 && dbStatus === 'ready' && connectionTest && (
                  <div className="mt-3 p-4 bg-green-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span> {connectionTest.connection.status}
                      </div>
                      <div>
                        <span className="font-medium">Provider:</span> {connectionTest.connection.provider}
                      </div>
                      <div>
                        <span className="font-medium">Database:</span> {connectionTest.connection.database}
                      </div>
                      <div>
                        <span className="font-medium">Health:</span> {connectionTest.health.healthy ? 'Healthy' : 'Issues'}
                      </div>
                    </div>
                  </div>
                )}

                {stepItem.id === 1 && dbStatus === 'not_ready' && (
                  <div className="mt-3 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Database tables not found. Please go to Settings → Database to initialize.
                    </p>
                  </div>
                )}

                {/* Step 2 Content */}
                {stepItem.id === 2 && dbStatus === 'ready' && !testUser && (
                  <div className="mt-3">
                    <button
                      onClick={createTestUser}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <SafeIcon icon={isLoading ? FiRefreshCw : FiUser} className={`inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Creating Test User...' : 'Create Test User'}
                    </button>
                  </div>
                )}

                {stepItem.id === 2 && testUser && (
                  <div className="mt-3 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">✅ Test user created successfully!</p>
                    <div className="text-xs text-green-700 space-y-1">
                      <div><span className="font-medium">Email:</span> {testUser.email}</div>
                      <div><span className="font-medium">Password:</span> testpass123</div>
                      <div><span className="font-medium">Name:</span> {testUser.name}</div>
                    </div>
                  </div>
                )}

                {/* Step 3 Content */}
                {stepItem.id === 3 && testUser && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">🎉 Your application is ready!</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>✅ Neon database connected</div>
                      <div>✅ All tables created</div>
                      <div>✅ Authentication working</div>
                      <div>✅ Drizzle ORM configured</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        {testUser && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Try the Login</h4>
                <p className="text-sm text-gray-600 mb-3">Test the authentication with your test user credentials.</p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Go to Login <SafeIcon icon={FiArrowRight} className="inline ml-1" />
                </button>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Explore Features</h4>
                <p className="text-sm text-gray-600 mb-3">Check out campaigns, analytics, and other features.</p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Dashboard <SafeIcon icon={FiArrowRight} className="inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Connection Error */}
        {dbStatus === 'error' && (
          <div className="border-t border-gray-200 pt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Connection Issues</h4>
              <p className="text-sm text-red-700 mb-3">
                Unable to connect to your Neon database. Please check your configuration.
              </p>
              <button
                onClick={checkDatabaseSetup}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <SafeIcon icon={FiRefreshCw} className="inline mr-1" />
                Retry Connection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStart;
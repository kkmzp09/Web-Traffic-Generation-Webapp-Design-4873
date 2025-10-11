import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { Navigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLogIn, FiUserPlus, FiMail, FiLock } = FiIcons;

const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLoggingIn) {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const InputField = ({ icon, type, placeholder, value, onChange }) => (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <SafeIcon icon={icon} className="h-5 w-5 text-gray-400" />
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-red-500 focus:border-red-500"
        required
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Trafficker</h1>
          <p className="text-gray-500 mt-2">
            {isLoggingIn ? 'Welcome back! Please sign in.' : 'Create an account to get started.'}
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              icon={FiMail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              icon={FiLock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
              >
                <SafeIcon icon={isLoggingIn ? FiLogIn : FiUserPlus} className="h-5 w-5 mr-2" />
                {loading ? 'Processing...' : (isLoggingIn ? 'Sign In' : 'Register')}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoggingIn(!isLoggingIn);
                setError(null);
              }}
              className="text-sm text-red-600 hover:text-red-500"
            >
              {isLoggingIn ? 'Need an account? Register' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
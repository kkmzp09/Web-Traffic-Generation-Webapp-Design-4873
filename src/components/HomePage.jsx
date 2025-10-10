import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import AuthModal from './AuthModal';
import { useAuth } from '../lib/authContext';
import { 
  startCampaign, 
  handleApiError, 
  buildCampaignRequest
} from '../api';

const { 
  FiZap, FiGlobe, FiUsers, FiTrendingUp, FiShield, FiPlay, FiStop,
  FiActivity, FiCheckCircle, FiXCircle, FiTarget, FiLogIn, FiUserPlus,
  FiBarChart3, FiClock, FiServer, FiMousePointer
} = FiIcons;

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [trafficAmount, setTrafficAmount] = useState(100);
  const [duration, setDuration] = useState(60);
  
  // Status and results
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [totalSent, setTotalSent] = useState(0);
  const [currentCampaign, setCurrentCampaign] = useState(null);

  const validateUrl = (url) => {
    if (!url.trim()) return false;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const startTraffic = async () => {
    if (!validateUrl(websiteUrl)) {
      setStatus('Please enter a valid website URL');
      return;
    }

    setIsRunning(true);
    setStatus('Starting traffic generation...');
    setProgress(0);
    setTotalSent(0);

    try {
      const normalizedUrl = normalizeUrl(websiteUrl);
      
      // Create campaign data
      const campaignData = buildCampaignRequest({
        urls: normalizedUrl,
        dwellMs: Math.floor((duration * 1000) / trafficAmount), // Distribute duration across visits
        scroll: true,
        advancedSettings: {
          naturalScrolling: true,
          randomDelay: true,
          mouseMovements: true,
          screenshots: false,
          incognito: true,
          maxClicks: 3,
          trafficAmount,
          duration
        }
      });

      console.log('Starting campaign with data:', campaignData);
      const response = await startCampaign(campaignData);
      console.log('Campaign started:', response);
      
      const campaignId = response.id || response.sessionId || `traffic_${Date.now()}`;
      
      setCurrentCampaign(campaignId);
      setStatus(`Traffic generation started! Campaign ID: ${campaignId}`);
      
      // Start progress simulation
      simulateProgress();
      
    } catch (error) {
      console.error('Campaign start failed:', error);
      const errorMessage = handleApiError(error, 'Traffic generation');
      setStatus(`Error: ${errorMessage}`);
      setIsRunning(false);
    }
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        const sent = Math.floor((newProgress / 100) * trafficAmount);
        setTotalSent(sent);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setStatus(`Traffic generation completed! Sent ${trafficAmount} visits to your website.`);
          return 100;
        }
        return newProgress;
      });
    }, (duration * 1000) / 100); // Update progress based on duration
  };

  const stopTraffic = () => {
    setIsRunning(false);
    setStatus('Traffic generation stopped');
    setProgress(0);
    setTotalSent(0);
    setCurrentCampaign(null);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const features = [
    {
      icon: FiZap,
      title: 'Instant Traffic',
      description: 'Generate real website traffic in seconds with our powerful infrastructure'
    },
    {
      icon: FiShield,
      title: 'Safe & Secure',
      description: 'All traffic is generated through secure browsers with natural human-like behavior'
    },
    {
      icon: FiGlobe,
      title: 'Global Reach',
      description: 'Traffic appears to come from different geographical locations worldwide'
    },
    {
      icon: FiTrendingUp,
      title: 'Real Analytics',
      description: 'All visits show up in your Google Analytics and other tracking platforms'
    },
    {
      icon: FiUsers,
      title: 'Human-Like',
      description: 'Advanced simulation includes scrolling, mouse movements, and page interactions'
    },
    {
      icon: FiBarChart3,
      title: 'Live Monitoring',
      description: 'Watch your traffic generation in real-time with detailed progress tracking'
    }
  ];

  const stats = [
    { label: 'Websites Boosted', value: '10,000+', icon: FiGlobe },
    { label: 'Traffic Generated', value: '50M+', icon: FiUsers },
    { label: 'Success Rate', value: '99.9%', icon: FiCheckCircle },
    { label: 'Server Uptime', value: '24/7', icon: FiServer }
  ];

  // If user is authenticated, redirect them (this will be handled by App.jsx)
  if (isAuthenticated) {
    return null; // App.jsx will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiZap} className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-900">TrafficGen Pro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <SafeIcon icon={FiLogIn} className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <SafeIcon icon={FiUserPlus} className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiZap} className="text-white text-2xl" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TrafficGen Pro
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
              Boost Your Website Traffic
              <span className="block text-blue-600">Instantly & Safely</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Generate real, human-like website traffic using our advanced automation. 
              Increase your site visits, improve SEO rankings, and boost your online presence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Free
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Sign In to Dashboard
              </button>
            </div>
          </motion.div>

          {/* Demo Traffic Generator */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Try Our Traffic Generator
                </h3>
                <p className="text-gray-600">
                  See how easy it is to boost your website traffic
                </p>
              </div>

              {/* URL Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SafeIcon icon={FiGlobe} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Enter your website URL (e.g., example.com)"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* Traffic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Traffic Amount
                  </label>
                  <select
                    value={trafficAmount}
                    onChange={(e) => setTrafficAmount(Number(e.target.value))}
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  >
                    <option value={50}>50 visits</option>
                    <option value={100}>100 visits</option>
                    <option value={250}>250 visits</option>
                    <option value={500}>500 visits</option>
                    <option value={1000}>1,000 visits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                    <option value={1800}>30 minutes</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <div className="mb-8">
                {!isRunning ? (
                  <button
                    onClick={startTraffic}
                    disabled={!websiteUrl.trim()}
                    className={`w-full py-4 px-8 text-xl font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 ${
                      !websiteUrl.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    }`}
                  >
                    <SafeIcon icon={FiPlay} className="text-2xl" />
                    <span>Start Traffic Generation</span>
                  </button>
                ) : (
                  <button
                    onClick={stopTraffic}
                    className="w-full py-4 px-8 text-xl font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
                  >
                    <SafeIcon icon={FiStop} className="text-2xl" />
                    <span>Stop Traffic Generation</span>
                  </button>
                )}
              </div>

              {/* Status Display */}
              <AnimatePresence>
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gray-50 rounded-xl p-6 mb-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <SafeIcon 
                        icon={
                          status.includes('Error') ? FiXCircle :
                          status.includes('completed') ? FiCheckCircle :
                          isRunning ? FiActivity : FiTarget
                        } 
                        className={`text-xl ${
                          status.includes('Error') ? 'text-red-600' :
                          status.includes('completed') ? 'text-green-600' :
                          isRunning ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                      <span className="font-medium text-gray-900">{status}</span>
                    </div>

                    {/* Progress Bar */}
                    {isRunning && (
                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{Math.round(progress)}% Complete</span>
                          <span>{totalSent} / {trafficAmount} visits sent</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Stats */}
              {isRunning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <SafeIcon icon={FiUsers} className="text-blue-600 text-xl mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{totalSent}</div>
                    <div className="text-sm text-blue-600">Visits Sent</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <SafeIcon icon={FiActivity} className="text-green-600 text-xl mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
                    <div className="text-sm text-green-600">Progress</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <SafeIcon icon={FiClock} className="text-purple-600 text-xl mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{duration}s</div>
                    <div className="text-sm text-purple-600">Duration</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <SafeIcon icon={FiMousePointer} className="text-orange-600 text-xl mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">Auto</div>
                    <div className="text-sm text-orange-600">Behavior</div>
                  </div>
                </motion.div>
              )}

              {/* Sign Up Prompt */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Want More Advanced Features?
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Sign up for free to access unlimited campaigns, detailed analytics, and premium traffic options
                  </p>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-20"
          >
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose TrafficGen Pro?
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our advanced traffic generation system delivers real, high-quality visits that look and behave like genuine users
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <SafeIcon icon={feature.icon} className="text-white text-xl" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                Trusted by Thousands of Websites
              </h3>
              <p className="text-xl text-blue-100">
                Join the growing community of successful website owners
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <SafeIcon icon={stat.icon} className="text-4xl mx-auto mb-4 text-blue-200" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20"
          >
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h3>
              <p className="text-xl text-gray-600">
                Simple, fast, and effective traffic generation in 3 easy steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Enter Your URL',
                  description: 'Simply paste your website URL into our secure traffic generator',
                  icon: FiGlobe
                },
                {
                  step: '02',
                  title: 'Configure Settings',
                  description: 'Choose your traffic amount and duration based on your needs',
                  icon: FiTarget
                },
                {
                  step: '03',
                  title: 'Watch Traffic Flow',
                  description: 'Monitor real-time progress as visitors start arriving at your site',
                  icon: FiTrendingUp
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SafeIcon icon={step.icon} className="text-white text-2xl" />
                  </div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">STEP {step.step}</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-20 text-center"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Boost Your Traffic?
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of website owners who trust TrafficGen Pro for their traffic needs
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}
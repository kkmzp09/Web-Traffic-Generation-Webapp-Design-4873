import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import {
  startCampaign,
  checkServerHealth,
  buildCampaignRequest,
  handleApiError,
  getServerUrl,
} from '../api';
import { DEFAULT_SERVER_CONFIG } from '../config';

const { FiZap, FiPlay, FiTarget, FiGlobe, FiBarChart } = FiIcons;

function DirectTraffic() {
  const [targetUrl, setTargetUrl] = useState('https://jobmakers.in');
  const [trafficAmount, setTrafficAmount] = useState(10);
  const [campaignStatus, setCampaignStatus] = useState(null);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [serverConfig] = useState(DEFAULT_SERVER_CONFIG);

  const checkApiConnection = async () => {
    setServerStatus('checking');
    try {
      await checkServerHealth(serverConfig);
      setServerStatus('ok');
    } catch (error) {
      setServerStatus('error');
      console.error(handleApiError(error, 'Health check'));
    }
  };

  useEffect(() => {
    checkApiConnection();
  }, [serverConfig]);

  const handleRunCampaign = async () => {
    setCampaignStatus('running');
    try {
      const payload = buildCampaignRequest({
        urls: [targetUrl],
        dwellMs: 10000,
        scroll: true,
      });
      // We are not using the result of startCampaign for now
      await startCampaign(payload, serverConfig);
      setCampaignStatus('finished');
      // Here you would normally start polling for status
    } catch (error) {
      setCampaignStatus('error');
      console.error(handleApiError(error, 'Campaign start'));
    }
  };

  const getStatusIndicator = () => {
    if (serverStatus === 'checking') {
      return (
        <div className="flex items-center text-yellow-500">
          <SafeIcon icon={FiZap} className="animate-pulse" />
          <span className="ml-2 text-sm">Checking API...</span>
        </div>
      );
    }
    if (serverStatus === 'ok') {
      return (
        <div className="flex items-center text-green-500">
          <SafeIcon icon={FiZap} />
          <span className="ml-2 text-sm">API Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-red-500">
        <SafeIcon icon={FiZap} />
        <span className="ml-2 text-sm">API Unreachable</span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <SafeIcon icon={FiTarget} className="mr-3 text-red-500" />
                Direct Traffic
              </h1>
              <p className="text-gray-500 mt-1">Send direct visits to a URL.</p>
            </div>
            {getStatusIndicator()}
          </div>

          <div className="space-y-6">
            <motion.div
              className="p-5 bg-gray-100 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <label
                htmlFor="targetUrl"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
              >
                <SafeIcon icon={FiGlobe} className="mr-2" />
                Target URL
              </label>
              <input
                type="text"
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500 mt-2">
                This is the destination for the simulated traffic.
              </p>
            </motion.div>

            <motion.div
              className="p-5 bg-gray-100 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <label
                htmlFor="trafficAmount"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
              >
                <SafeIcon icon={FiBarChart} className="mr-2" />
                Traffic Amount
              </label>
              <input
                type="range"
                id="trafficAmount"
                min="1"
                max="100"
                value={trafficAmount}
                onChange={(e) => setTrafficAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: 'rgb(239 68 68)' }}
              />
              <div className="text-center text-lg font-semibold text-gray-800 mt-2">
                {trafficAmount} visits
              </div>
            </motion.div>
          </div>

          <div className="mt-8">
            <motion.button
              onClick={handleRunCampaign}
              disabled={campaignStatus === 'running' || serverStatus !== 'ok'}
              className="w-full py-3 px-4 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center">
                <SafeIcon icon={FiPlay} className="mr-2" />
                {campaignStatus === 'running' ? 'Campaign Running...' : 'Run Campaign'}
              </div>
            </motion.button>
          </div>

          {campaignStatus && (
            <div className="mt-6 text-center">
              {campaignStatus === 'running' && (
                <p className="text-blue-600">Campaign is in progress...</p>
              )}
              {campaignStatus === 'finished' && (
                <p className="text-green-600">Campaign finished successfully!</p>
              )}
              {campaignStatus === 'error' && (
                <p className="text-red-600">
                  There was an error running the campaign.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            API Endpoint: {getServerUrl(serverConfig)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DirectTraffic;
// src/pages/RunCampaign.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { DEFAULT_SERVER_CONFIG, CAMPAIGN_DEFAULTS } from '../config';
import {
  startCampaign,
  checkCampaignStatus,
  getCampaignResults,
  stopCampaign,
  checkServerHealth,
  buildCampaignRequest,
  handleApiError,
  validateServerConfig,
  getServerUrl
} from '../api';

const {
  FiPlay, FiPause, FiStop, FiRefreshCw, FiMonitor, FiGlobe,
  FiClock, FiActivity, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiSettings, FiEye, FiDownload, FiVideo, FiChrome, FiTarget,
  FiTrendingUp, FiUsers, FiZap, FiCpu, FiWifi, FiServer,
  FiCloud, FiDatabase, FiTerminal, FiEdit3, FiUserCheck
} = FiIcons;

export default function RunCampaign() {
  const { user, isAuthenticated } = useAuth();

  const [serverConfig, setServerConfig] = useState(DEFAULT_SERVER_CONFIG);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isServerConfigured, setIsServerConfigured] = useState(true);

  const [urlsText, setUrlsText] = useState(
    'https://jobmakers.in\nhttps://jobmakers.in/about\nhttps://jobmakers.in/services'
  );
  const [dwellMs, setDwellMs] = useState(CAMPAIGN_DEFAULTS.dwellMs);
  const [scroll, setScroll] = useState(CAMPAIGN_DEFAULTS.scroll);

  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('config');
  const [workerStatus, setWorkerStatus] = useState('checking');

  const [advancedSettings, setAdvancedSettings] = useState(CAMPAIGN_DEFAULTS);

  useEffect(() => {
    const saved = localStorage.getItem(
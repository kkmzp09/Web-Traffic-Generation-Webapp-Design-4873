import React, { useState, useEffect, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { generateDeviceFingerprint, releaseSessionProxy } from '../lib/deviceFingerprint';
import { getProxyStats } from '../lib/proxyManager';

const { 
  FiX, FiMaximize2, FiMinimize2, FiRefreshCw, FiPause, FiPlay, FiSettings, 
  FiEye, FiMousePointer, FiClock, FiSearch, FiArrowLeft, FiArrowRight, 
  FiHome, FiBookmark, FiDownload, FiShare2, FiMenu, FiMonitor, FiActivity,
  FiTarget, FiZap, FiGlobe, FiChevronDown, FiPlus, FiMinus, FiRotateCcw,
  FiLock, FiUnlock, FiWifi, FiBattery, FiVolume2, FiSmartphone, FiFingerprint,
  FiServer, FiShield, FiMapPin, FiTrendingUp
} = FiIcons;

const PortfolioWindow = ({ campaign, onClose, isVisible }) => {
  // Desktop Environment State
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showDesktop, setShowDesktop] = useState(true);
  const [showBrowser, setShowBrowser] = useState(false);
  
  // Fingerprint & Proxy State
  const [desktopFingerprint, setDesktopFingerprint] = useState(null);
  const [mobileFingerprint, setMobileFingerprint] = useState(null);
  const [activeFingerprint, setActiveFingerprint] = useState('desktop');
  const [fingerprintGenerated, setFingerprintGenerated] = useState(false);
  const [proxyStats, setProxyStats] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // Browser State
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [browserHistory, setBrowserHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressBarValue, setAddressBarValue] = useState('');
  
  // Agent State
  const [agentMode, setAgentMode] = useState('exploring'); // exploring, searching, analyzing, navigating
  const [currentAction, setCurrentAction] = useState('Initializing desktop session...');
  const [agentThoughts, setAgentThoughts] = useState([]);
  const [sessionPlan, setSessionPlan] = useState([]);
  const [currentPlanStep, setCurrentPlanStep] = useState(0);
  
  // Statistics & Analytics
  const [sessionStats, setSessionStats] = useState({
    pagesVisited: 0,
    timeSpent: 0,
    scrollActions: 0,
    clickActions: 0,
    searchQueries: 0,
    tabsOpened: 0,
    uniqueDomains: new Set(),
    fingerprintSwitches: 0,
    proxyAssignments: 0
  });
  
  // Settings
  const [agentSettings, setAgentSettings] = useState({
    browsingSpeed: 2,
    sessionDuration: 600,
    searchBehavior: 'intelligent',
    tabManagement: 'smart',
    scrollPattern: 'natural',
    interactionDelay: 'human-like',
    fingerprintRotation: true,
    deviceSwitching: true,
    proxyRotation: true,
    proxyType: 'auto' // auto, residential, datacenter, mobile
  });
  
  // Refs
  const iframeRef = useRef(null);
  const desktopRef = useRef(null);
  const agentTimeoutRef = useRef(null);
  const sessionIntervalRef = useRef(null);
  const searchInputRef = useRef(null);
  const fingerprintIntervalRef = useRef(null);
  const proxyStatsIntervalRef = useRef(null);
  
  // Desktop Environment Setup
  useEffect(() => {
    if (isVisible && campaign) {
      initializeDesktopSession();
    }
    
    return () => {
      cleanupSession();
    };
  }, [isVisible, campaign]);

  // Initialize proxy stats monitoring
  useEffect(() => {
    if (isVisible) {
      updateProxyStats();
      proxyStatsIntervalRef.current = setInterval(updateProxyStats, 10000); // Update every 10 seconds
    }
    
    return () => {
      if (proxyStatsIntervalRef.current) {
        clearInterval(proxyStatsIntervalRef.current);
      }
    };
  }, [isVisible]);

  const updateProxyStats = async () => {
    try {
      const stats = getProxyStats();
      setProxyStats(stats);
    } catch (error) {
      console.error('Error updating proxy stats:', error);
    }
  };

  const initializeDesktopSession = async () => {
    setCurrentAction('🖥️ Booting desktop environment...');
    
    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    setCurrentSessionId(sessionId);
    
    // Generate initial fingerprints with proxy assignment
    try {
      setCurrentAction('🔐 Generating device fingerprints with proxy assignment...');
      
      const proxyPreferences = {
        country: campaign.countries ? JSON.parse(campaign.countries)[0] : 'US',
        proxyType: agentSettings.proxyType === 'auto' ? undefined : agentSettings.proxyType
      };
      
      const [desktop, mobile] = await Promise.all([
        generateDeviceFingerprint('desktop', `${sessionId}_desktop`, proxyPreferences),
        generateDeviceFingerprint('mobile', `${sessionId}_mobile`, proxyPreferences)
      ]);
      
      setDesktopFingerprint(desktop);
      setMobileFingerprint(mobile);
      setFingerprintGenerated(true);
      
      addAgentThought(`🔐 Generated unique fingerprints with proxy assignment:`);
      addAgentThought(`🖥️ Desktop: ${desktop.id.slice(-8)} | IP: ${desktop.network.ip} (${desktop.proxy?.type || 'direct'})`);
      addAgentThought(`📱 Mobile: ${mobile.id.slice(-8)} | IP: ${mobile.network.ip} (${mobile.proxy?.type || 'direct'})`);
      
      if (desktop.proxy) {
        addAgentThought(`🌐 Desktop Proxy: ${desktop.proxy.provider} | Score: ${desktop.proxy.score.toFixed(1)} | ${desktop.proxy.location.city}, ${desktop.proxy.country}`);
        updateStats('proxyAssignments', 1);
      }
      
      if (mobile.proxy) {
        addAgentThought(`📱 Mobile Proxy: ${mobile.proxy.provider} | Score: ${mobile.proxy.score.toFixed(1)} | ${mobile.proxy.location.city}, ${mobile.proxy.country}`);
        updateStats('proxyAssignments', 1);
      }
      
    } catch (error) {
      console.error('Error generating fingerprints:', error);
      addAgentThought('⚠️ Fingerprint generation failed, using fallback');
    }
    
    // Simulate desktop boot sequence
    setTimeout(() => {
      setCurrentAction('🌐 Initializing browser engine with proxy configuration...');
      setShowDesktop(true);
      
      setTimeout(() => {
        setCurrentAction('🎯 Planning browsing strategy with proxy rotation...');
        createSessionPlan();
        
        setTimeout(() => {
          startAgentSession();
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const createSessionPlan = () => {
    const plan = [
      {
        step: 'Proxy & Fingerprint Setup',
        action: 'setup_proxy_fingerprints',
        duration: 2000,
        description: 'Configuring proxy IPs and device fingerprints'
      },
      {
        step: 'Proxy Validation',
        action: 'validate_proxies',
        duration: 3000,
        description: 'Testing proxy connectivity and anonymity scores'
      },
      {
        step: 'Desktop Analysis',
        action: 'analyze_environment',
        duration: 3000,
        description: 'Examining desktop and available applications'
      },
      {
        step: 'Browser Launch',
        action: 'launch_browser',
        duration: 2000,
        description: 'Opening web browser with proxy configuration'
      },
      {
        step: 'Proxy Injection',
        action: 'inject_proxy',
        duration: 1500,
        description: 'Configuring browser to use assigned proxy IP'
      },
      {
        step: 'Fingerprint Injection',
        action: 'inject_fingerprint',
        duration: 1500,
        description: 'Applying device fingerprint to browser'
      },
      {
        step: 'Navigation Setup',
        action: 'setup_navigation',
        duration: 1500,
        description: 'Configuring browser for optimal experience'
      },
      {
        step: 'Target Analysis',
        action: 'analyze_target',
        duration: 4000,
        description: 'Loading and analyzing target website'
      },
      {
        step: 'Content Discovery',
        action: 'discover_content',
        duration: 5000,
        description: 'Exploring site structure and content'
      },
      {
        step: 'Proxy & Device Switch',
        action: 'switch_proxy_device',
        duration: 3000,
        description: 'Rotating to new proxy IP and mobile fingerprint'
      },
      {
        step: 'Mobile Browsing',
        action: 'mobile_browsing',
        duration: 8000,
        description: 'Simulating mobile browsing with new proxy'
      },
      {
        step: 'Search Integration',
        action: 'perform_searches',
        duration: 8000,
        description: 'Conducting searches through proxy network'
      },
      {
        step: 'Deep Navigation',
        action: 'deep_navigate',
        duration: 10000,
        description: 'Navigating through internal pages'
      },
      {
        step: 'Multi-tab Browsing',
        action: 'multi_tab_session',
        duration: 12000,
        description: 'Opening multiple tabs with proxy load balancing'
      },
      {
        step: 'Proxy Performance Test',
        action: 'test_proxy_performance',
        duration: 5000,
        description: 'Testing proxy speed and reliability'
      },
      {
        step: 'Content Analysis',
        action: 'analyze_content',
        duration: 15000,
        description: 'Deep reading and content analysis'
      },
      {
        step: 'Session Summary',
        action: 'summarize_session',
        duration: 3000,
        description: 'Compiling session insights and proxy performance'
      }
    ];
    
    setSessionPlan(plan);
    addAgentThought('📋 Created comprehensive browsing strategy with proxy and fingerprint rotation');
  };

  const startAgentSession = () => {
    setIsBrowsing(true);
    setCurrentAction('🚀 Starting intelligent agent session with proxy network...');
    
    // Start session timer
    sessionIntervalRef.current = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);
    
    // Start fingerprint rotation if enabled
    if (agentSettings.fingerprintRotation) {
      startFingerprintRotation();
    }
    
    executeSessionPlan();
  };

  const startFingerprintRotation = () => {
    fingerprintIntervalRef.current = setInterval(() => {
      if (agentSettings.deviceSwitching && Math.random() > 0.7) {
        switchFingerprint();
      }
    }, 45000); // Switch every 45 seconds randomly
  };

  const switchFingerprint = async () => {
    const newType = activeFingerprint === 'desktop' ? 'mobile' : 'desktop';
    setActiveFingerprint(newType);
    
    // Generate new fingerprint with new proxy assignment
    try {
      const sessionId = `${currentSessionId}_${newType}_${Date.now()}`;
      
      const proxyPreferences = {
        country: campaign.countries ? JSON.parse(campaign.countries)[Math.floor(Math.random() * JSON.parse(campaign.countries).length)] : 'US',
        proxyType: agentSettings.proxyType === 'auto' ? undefined : agentSettings.proxyType
      };
      
      const newFingerprint = await generateDeviceFingerprint(newType, sessionId, proxyPreferences);
      
      if (newType === 'desktop') {
        setDesktopFingerprint(newFingerprint);
      } else {
        setMobileFingerprint(newFingerprint);
      }
      
      updateStats('fingerprintSwitches', 1);
      if (newFingerprint.proxy) {
        updateStats('proxyAssignments', 1);
      }
      
      addAgentThought(`🔄 Switched to ${newType} fingerprint with new proxy`);
      addAgentThought(`🆔 New identity: ${newFingerprint.id.slice(-8)}`);
      addAgentThought(`🌐 New IP: ${newFingerprint.network.ip} (${newFingerprint.proxy?.type || 'direct'})`);
      
      if (newFingerprint.proxy) {
        addAgentThought(`📊 Proxy Score: ${newFingerprint.proxy.score.toFixed(1)} | ${newFingerprint.proxy.location.city}, ${newFingerprint.proxy.country}`);
      }
      
    } catch (error) {
      console.error('Error switching fingerprint:', error);
      addAgentThought('⚠️ Fingerprint switch failed');
    }
  };

  const executeSessionPlan = () => {
    if (currentPlanStep >= sessionPlan.length) {
      setCurrentAction('✅ Session plan completed - Starting continuous monitoring with proxy rotation');
      startContinuousMode();
      return;
    }
    
    const currentStep = sessionPlan[currentPlanStep];
    setCurrentAction(`${currentStep.step}: ${currentStep.description}`);
    addAgentThought(`🎯 Executing: ${currentStep.step}`);
    
    executeAgentAction(currentStep.action);
    
    agentTimeoutRef.current = setTimeout(() => {
      setCurrentPlanStep(prev => prev + 1);
      executeSessionPlan();
    }, currentStep.duration);
  };

  const executeAgentAction = (action) => {
    switch (action) {
      case 'setup_proxy_fingerprints':
        setupProxyFingerprints();
        break;
      case 'validate_proxies':
        validateProxies();
        break;
      case 'analyze_environment':
        analyzeDesktopEnvironment();
        break;
      case 'launch_browser':
        launchBrowser();
        break;
      case 'inject_proxy':
        injectProxy();
        break;
      case 'inject_fingerprint':
        injectFingerprint();
        break;
      case 'setup_navigation':
        setupBrowserNavigation();
        break;
      case 'analyze_target':
        analyzeTargetWebsite();
        break;
      case 'discover_content':
        discoverSiteContent();
        break;
      case 'switch_proxy_device':
        switchProxyAndDevice();
        break;
      case 'mobile_browsing':
        performMobileBrowsing();
        break;
      case 'perform_searches':
        performIntelligentSearches();
        break;
      case 'deep_navigate':
        performDeepNavigation();
        break;
      case 'multi_tab_session':
        startMultiTabSession();
        break;
      case 'test_proxy_performance':
        testProxyPerformance();
        break;
      case 'analyze_content':
        performContentAnalysis();
        break;
      case 'summarize_session':
        summarizeSession();
        break;
      default:
        performBasicBrowsing();
    }
  };

  const setupProxyFingerprints = () => {
    if (desktopFingerprint && mobileFingerprint) {
      addAgentThought('🔐 Proxy-enabled fingerprints configured and ready');
      addAgentThought(`📊 Desktop proxy score: ${desktopFingerprint.proxy?.score?.toFixed(1) || 'N/A'}`);
      addAgentThought(`📊 Mobile proxy score: ${mobileFingerprint.proxy?.score?.toFixed(1) || 'N/A'}`);
    }
  };

  const validateProxies = () => {
    const currentFingerprint = activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
    if (currentFingerprint?.proxy) {
      addAgentThought(`🔍 Validating proxy: ${currentFingerprint.proxy.ip}:${currentFingerprint.proxy.port}`);
      addAgentThought(`✅ Proxy validation score: ${currentFingerprint.proxy.validationScore?.toFixed(1) || currentFingerprint.proxy.score.toFixed(1)}`);
      addAgentThought(`🌍 Proxy location: ${currentFingerprint.proxy.location.city}, ${currentFingerprint.proxy.country}`);
    } else {
      addAgentThought('⚠️ No proxy assigned, using direct connection');
    }
  };

  const injectProxy = () => {
    const currentFingerprint = activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
    if (currentFingerprint?.proxy) {
      addAgentThought(`🌐 Injecting proxy configuration: ${currentFingerprint.proxy.ip}`);
      addAgentThought(`🔒 Proxy type: ${currentFingerprint.proxy.type} | Provider: ${currentFingerprint.proxy.provider}`);
    }
  };

  const injectFingerprint = () => {
    const currentFingerprint = activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
    if (currentFingerprint) {
      addAgentThought(`💉 Injecting ${activeFingerprint} fingerprint into browser`);
      addAgentThought(`🎭 Spoofing: ${currentFingerprint.browser.userAgent.slice(0, 50)}...`);
      addAgentThought(`🌍 Apparent location: ${currentFingerprint.location.city}, ${currentFingerprint.location.country}`);
      if (currentFingerprint.proxy) {
        addAgentThought(`🔗 Via proxy: ${currentFingerprint.proxy.ip} (${currentFingerprint.proxy.type})`);
      }
    }
  };

  const switchProxyAndDevice = async () => {
    addAgentThought('🔄 Initiating proxy and device rotation...');
    await switchFingerprint();
    addAgentThought('✅ Proxy and device rotation completed');
  };

  const testProxyPerformance = () => {
    const currentFingerprint = activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
    if (currentFingerprint?.proxy) {
      addAgentThought('⚡ Testing proxy performance and latency');
      addAgentThought(`📊 Expected speed: ${currentFingerprint.proxy.location.isp} network`);
      addAgentThought(`🎯 Proxy score: ${currentFingerprint.proxy.score.toFixed(1)}/100`);
    }
  };

  const performMobileBrowsing = () => {
    addAgentThought('📱 Simulating mobile browsing patterns with proxy');
    addAgentThought('👆 Touch gestures and mobile scrolling behavior');
    
    const currentFingerprint = mobileFingerprint;
    if (currentFingerprint?.proxy) {
      addAgentThought(`📶 Mobile proxy: ${currentFingerprint.proxy.ip} (${currentFingerprint.proxy.type})`);
    }
    
    // Simulate mobile-specific actions
    setTimeout(() => {
      performMobileScrolling();
    }, 1000);
    
    setTimeout(() => {
      addAgentThought('📱 Mobile viewport adjustments applied');
    }, 3000);
  };

  const performMobileScrolling = () => {
    addAgentThought('📱 Executing mobile scroll patterns through proxy');
    
    const mobileScrollPatterns = [
      () => scrollToPosition(0),
      () => setTimeout(() => mobileSwipeDown(200), 500),
      () => setTimeout(() => pauseForAnalysis(1500), 1000),
      () => setTimeout(() => mobileSwipeDown(300), 2500),
      () => setTimeout(() => mobileSwipeUp(100), 4000),
      () => setTimeout(() => scrollToBottom(), 5000)
    ];
    
    mobileScrollPatterns.forEach(action => action());
    updateStats('scrollActions', 6);
  };

  const mobileSwipeDown = (distance) => {
    scrollWithAnimation(distance, 'down', 150); // Faster mobile scrolling
  };

  const mobileSwipeUp = (distance) => {
    scrollWithAnimation(distance, 'up', 150);
  };

  const analyzeDesktopEnvironment = () => {
    addAgentThought('🔍 Scanning desktop environment for available applications');
    setTimeout(() => {
      addAgentThought('✅ Found web browser with proxy support, ready to proceed');
    }, 1500);
  };

  const launchBrowser = () => {
    setShowBrowser(true);
    addAgentThought('🌐 Browser launched with proxy configuration');
    
    // Create initial tab
    const initialTab = {
      id: Date.now(),
      title: 'New Tab',
      url: 'about:blank',
      isLoading: false,
      favicon: null
    };
    
    setTabs([initialTab]);
    setActiveTab(0);
  };

  const setupBrowserNavigation = () => {
    setAddressBarValue(campaign.targetUrl);
    addAgentThought('🎯 Navigation configured for target website with proxy routing');
  };

  const analyzeTargetWebsite = () => {
    navigateToUrl(campaign.targetUrl);
    addAgentThought(`🌍 Loading target website through proxy: ${campaign.targetUrl}`);
    
    const currentFingerprint = activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
    if (currentFingerprint?.proxy) {
      addAgentThought(`🔗 Request routed via: ${currentFingerprint.proxy.ip} (${currentFingerprint.proxy.location.city})`);
    }
    
    setTimeout(() => {
      addAgentThought('📊 Analyzing page structure and content through proxy');
      updateStats('pagesVisited', 1);
      updateStats('uniqueDomains', new URL(campaign.targetUrl).hostname);
    }, 2000);
  };

  const discoverSiteContent = () => {
    addAgentThought('🔍 Discovering internal links and site structure');
    performIntelligentScrolling();
    
    setTimeout(() => {
      const discoveredLinks = generateInternalLinks();
      addAgentThought(`📋 Discovered ${discoveredLinks.length} internal pages to explore via proxy`);
    }, 3000);
  };

  const performIntelligentSearches = () => {
    const searchQueries = generateSearchQueries();
    let queryIndex = 0;
    
    const executeSearch = () => {
      if (queryIndex >= searchQueries.length) return;
      
      const query = searchQueries[queryIndex];
      setSearchQuery(query);
      addAgentThought(`🔍 Searching for: "${query}" through proxy network`);
      
      // Simulate search
      setTimeout(() => {
        performSearchBehavior(query);
        updateStats('searchQueries', 1);
        queryIndex++;
        
        if (queryIndex < searchQueries.length) {
          setTimeout(executeSearch, 3000);
        }
      }, 1000);
    };
    
    executeSearch();
  };

  const performDeepNavigation = () => {
    const internalLinks = generateInternalLinks();
    let linkIndex = 0;
    
    const navigateToNextLink = () => {
      if (linkIndex >= internalLinks.length) return;
      
      const link = internalLinks[linkIndex];
      addAgentThought(`🔗 Navigating to: ${link}${getCurrentProxyInfo()}`);
      
      navigateToUrl(link);
      updateStats('pagesVisited', 1);
      updateStats('clickActions', 1);
      
      setTimeout(() => {
        performContentReading();
        linkIndex++;
        
        if (linkIndex < internalLinks.length) {
          setTimeout(navigateToNextLink, 8000);
        }
      }, 2000);
    };
    
    navigateToNextLink();
  };

  const startMultiTabSession = () => {
    addAgentThought('📑 Starting multi-tab browsing session with proxy load balancing');
    
    const urlsToOpen = generateInternalLinks().slice(0, 3);
    
    urlsToOpen.forEach((url, index) => {
      setTimeout(() => {
        openNewTab(url);
        addAgentThought(`📋 Opened new tab: ${url}${getCurrentProxyInfo()}`);
      }, index * 2000);
    });
  };

  const performContentAnalysis = () => {
    addAgentThought('📖 Performing deep content analysis through proxy network');
    
    const analysisActions = [
      () => performDeepReading(),
      () => setTimeout(() => analyzePageElements(), 3000),
      () => setTimeout(() => checkPagePerformance(), 6000),
      () => setTimeout(() => evaluateUserExperience(), 9000),
      () => setTimeout(() => assessContentQuality(), 12000)
    ];
    
    analysisActions.forEach(action => action());
  };

  const summarizeSession = () => {
    addAgentThought('📊 Generating session summary with proxy performance metrics');
    
    setTimeout(() => {
      const summary = {
        totalPages: sessionStats.pagesVisited,
        timeSpent: sessionStats.timeSpent,
        interactions: sessionStats.clickActions + sessionStats.scrollActions,
        searches: sessionStats.searchQueries,
        domains: sessionStats.uniqueDomains.size,
        fingerprintSwitches: sessionStats.fingerprintSwitches,
        proxyAssignments: sessionStats.proxyAssignments
      };
      
      addAgentThought(`✅ Session complete: ${summary.totalPages} pages, ${summary.interactions} interactions`);
      addAgentThought(`🔄 ${summary.fingerprintSwitches} fingerprint switches, ${summary.proxyAssignments} proxy assignments`);
    }, 2000);
  };

  const getCurrentProxyInfo = () => {
    const currentFingerprint = activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
    if (currentFingerprint?.proxy) {
      return ` (via ${currentFingerprint.proxy.ip})`;
    }
    return '';
  };

  // Missing function - Added to fix the build error
  const performBasicBrowsing = () => {
    addAgentThought('🌐 Starting basic browsing behavior with proxy');
    
    // Perform basic browsing actions
    setTimeout(() => {
      performIntelligentScrolling();
    }, 1000);
    
    setTimeout(() => {
      performContentReading();
    }, 3000);
    
    setTimeout(() => {
      addAgentThought('📖 Completed basic browsing session');
    }, 6000);
  };

  // Browser Functions
  const navigateToUrl = (url) => {
    setIsLoading(true);
    setAddressBarValue(url);
    
    if (tabs.length > 0) {
      const updatedTabs = [...tabs];
      updatedTabs[activeTab] = {
        ...updatedTabs[activeTab],
        url: url,
        isLoading: true,
        title: 'Loading...'
      };
      setTabs(updatedTabs);
    }
    
    // Add to history
    setBrowserHistory(prev => [...prev, url]);
    setHistoryIndex(prev => prev + 1);
    
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    
    setTimeout(() => {
      setIsLoading(false);
      if (tabs.length > 0) {
        const updatedTabs = [...tabs];
        updatedTabs[activeTab] = {
          ...updatedTabs[activeTab],
          isLoading: false,
          title: extractTitleFromUrl(url)
        };
        setTabs(updatedTabs);
      }
    }, 2000);
  };

  const openNewTab = (url = 'about:blank') => {
    const newTab = {
      id: Date.now(),
      title: url === 'about:blank' ? 'New Tab' : extractTitleFromUrl(url),
      url: url,
      isLoading: url !== 'about:blank',
      favicon: null
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTab(tabs.length);
    updateStats('tabsOpened', 1);
    
    if (url !== 'about:blank') {
      navigateToUrl(url);
    }
  };

  const closeTab = (tabIndex) => {
    if (tabs.length <= 1) return;
    
    const updatedTabs = tabs.filter((_, index) => index !== tabIndex);
    setTabs(updatedTabs);
    
    if (activeTab >= tabIndex) {
      setActiveTab(Math.max(0, activeTab - 1));
    }
  };

  const switchTab = (tabIndex) => {
    setActiveTab(tabIndex);
    const tab = tabs[tabIndex];
    if (tab && tab.url !== 'about:blank') {
      setAddressBarValue(tab.url);
      if (iframeRef.current) {
        iframeRef.current.src = tab.url;
      }
    }
  };

  // Intelligent Behaviors
  const generateSearchQueries = () => {
    const domain = new URL(campaign.targetUrl).hostname;
    const companyName = domain.split('.')[0];
    
    return [
      `${companyName} services`,
      `${companyName} about us`,
      `${companyName} contact information`,
      `${companyName} products`,
      `${companyName} reviews`,
      `site:${domain} pricing`,
      `site:${domain} blog`,
      `${companyName} careers`
    ];
  };

  const generateInternalLinks = () => {
    const baseUrl = campaign.targetUrl.replace(/\/$/, '');
    const commonPaths = [
      '/about', '/about-us', '/services', '/products', '/portfolio',
      '/contact', '/blog', '/news', '/team', '/careers', '/pricing',
      '/features', '/gallery', '/testimonials', '/faq', '/support',
      '/privacy', '/terms', '/sitemap', '/resources'
    ];
    
    return commonPaths.map(path => `${baseUrl}${path}`);
  };

  const performSearchBehavior = (query) => {
    // Simulate intelligent search behavior
    addAgentThought(`🔍 Analyzing search results for "${query}" via proxy`);
    
    setTimeout(() => {
      addAgentThought(`📊 Found relevant information for "${query}"`);
    }, 1500);
  };

  const performIntelligentScrolling = () => {
    const scrollPatterns = [
      () => scrollToPosition(0),
      () => setTimeout(() => slowScrollDown(300), 1000),
      () => setTimeout(() => pauseForAnalysis(2000), 2000),
      () => setTimeout(() => quickScrollDown(500), 4000),
      () => setTimeout(() => scrollToBottom(), 5000),
      () => setTimeout(() => scrollToTop(), 7000)
    ];
    
    scrollPatterns.forEach(action => action());
    updateStats('scrollActions', 6);
  };

  const performContentReading = () => {
    addAgentThought('📖 Reading and analyzing page content');
    
    const readingPattern = [
      () => scrollToPosition(200),
      () => setTimeout(() => pauseForAnalysis(3000), 500),
      () => setTimeout(() => slowScrollDown(400), 3500),
      () => setTimeout(() => pauseForAnalysis(2500), 4000),
      () => setTimeout(() => slowScrollDown(600), 6500)
    ];
    
    readingPattern.forEach(action => action());
    updateStats('scrollActions', 3);
  };

  const performDeepReading = () => {
    addAgentThought('🔍 Performing deep content analysis');
    
    const deepAnalysis = [
      () => scrollToPosition(0),
      () => setTimeout(() => analyzeHeader(), 1000),
      () => setTimeout(() => scrollToPosition(400), 3000),
      () => setTimeout(() => analyzeMainContent(), 4000),
      () => setTimeout(() => scrollToBottom(), 7000),
      () => setTimeout(() => analyzeFooter(), 8000)
    ];
    
    deepAnalysis.forEach(action => action());
  };

  const analyzeHeader = () => {
    addAgentThought('🎯 Analyzing website header and navigation');
  };

  const analyzeMainContent = () => {
    addAgentThought('📝 Analyzing main content structure');
  };

  const analyzeFooter = () => {
    addAgentThought('🔗 Analyzing footer links and information');
  };

  const analyzePageElements = () => {
    addAgentThought('🎨 Analyzing page design and layout');
  };

  const checkPagePerformance = () => {
    addAgentThought('⚡ Evaluating page loading performance through proxy');
  };

  const evaluateUserExperience = () => {
    addAgentThought('👤 Assessing user experience factors');
  };

  const assessContentQuality = () => {
    addAgentThought('✍️ Evaluating content quality and relevance');
  };

  // Utility Functions
  const addAgentThought = (thought) => {
    setAgentThoughts(prev => [
      ...prev.slice(-9), // Keep last 9 thoughts
      {
        id: Date.now(),
        thought,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const updateStats = (stat, value) => {
    setSessionStats(prev => {
      if (stat === 'uniqueDomains') {
        const newDomains = new Set(prev.uniqueDomains);
        newDomains.add(value);
        return { ...prev, uniqueDomains: newDomains };
      }
      return { ...prev, [stat]: prev[stat] + value };
    });
  };

  const extractTitleFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      if (path === '/' || path === '') return urlObj.hostname;
      return path.split('/').filter(Boolean).pop() || urlObj.hostname;
    } catch {
      return 'Unknown Page';
    }
  };

  // Scrolling Functions
  const scrollToPosition = (position) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.scrollTo({
          top: position,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.log('Cross-origin scrolling limitation');
    }
  };

  const slowScrollDown = (distance) => {
    scrollWithAnimation(distance, 'down', 100);
  };

  const quickScrollDown = (distance) => {
    scrollWithAnimation(distance, 'down', 50);
  };

  const scrollWithAnimation = (distance, direction, speed) => {
    try {
      if (iframeRef.current?.contentWindow) {
        const currentScroll = iframeRef.current.contentWindow.pageYOffset || 0;
        const targetScroll = direction === 'down' 
          ? currentScroll + distance 
          : Math.max(0, currentScroll - distance);
        
        iframeRef.current.contentWindow.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.log('Cross-origin scrolling limitation');
    }
  };

  const scrollToTop = () => scrollToPosition(0);
  const scrollToBottom = () => {
    try {
      if (iframeRef.current?.contentWindow?.document) {
        const height = iframeRef.current.contentWindow.document.body.scrollHeight;
        scrollToPosition(height);
      }
    } catch (error) {
      console.log('Cross-origin scrolling limitation');
    }
  };

  const pauseForAnalysis = (duration) => {
    addAgentThought(`🤔 Analyzing content... (${duration/1000}s)`);
  };

  // Control Functions
  const startContinuousMode = () => {
    // After plan completion, continue with intelligent browsing
    const continuousActions = [
      () => performIntelligentScrolling(),
      () => setTimeout(() => performContentReading(), 5000),
      () => setTimeout(() => performDeepNavigation(), 10000),
      () => setTimeout(() => {
        if (Math.random() > 0.6) switchFingerprint();
      }, 15000)
    ];
    
    const executeContinuous = () => {
      continuousActions.forEach(action => action());
      setTimeout(executeContinuous, 30000); // Repeat every 30 seconds
    };
    
    executeContinuous();
  };

  const toggleAgentMode = () => {
    if (isBrowsing) {
      setIsBrowsing(false);
      setCurrentAction('🛑 Agent session paused');
      if (agentTimeoutRef.current) clearTimeout(agentTimeoutRef.current);
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      if (fingerprintIntervalRef.current) clearInterval(fingerprintIntervalRef.current);
    } else {
      startAgentSession();
    }
  };

  const cleanupSession = () => {
    if (agentTimeoutRef.current) clearTimeout(agentTimeoutRef.current);
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    if (fingerprintIntervalRef.current) clearInterval(fingerprintIntervalRef.current);
    if (proxyStatsIntervalRef.current) clearInterval(proxyStatsIntervalRef.current);
    
    // Release proxies when session ends
    if (currentSessionId) {
      releaseSessionProxy(`${currentSessionId}_desktop`);
      releaseSessionProxy(`${currentSessionId}_mobile`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddressBarKeyPress = (e) => {
    if (e.key === 'Enter') {
      navigateToUrl(addressBarValue);
    }
  };

  const getCurrentFingerprint = () => {
    return activeFingerprint === 'desktop' ? desktopFingerprint : mobileFingerprint;
  };

  const toggleFingerprintType = () => {
    switchFingerprint();
  };

  if (!isVisible || !campaign) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-gray-900 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Desktop Environment */}
      <div className="w-full h-full relative overflow-hidden">
        
        {/* Desktop Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 z-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <SafeIcon icon={FiMonitor} className="text-blue-400" />
              <span className="text-sm font-medium">Desktop Agent</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300 text-xs">
              <SafeIcon icon={FiWifi} />
              <SafeIcon icon={FiVolume2} />
              <SafeIcon icon={FiBattery} />
            </div>
            {fingerprintGenerated && (
              <div className="flex items-center space-x-1 text-xs text-green-400">
                <SafeIcon icon={FiFingerprint} />
                <span>{activeFingerprint}</span>
                <SafeIcon icon={FiServer} className="text-purple-400" />
                <span>proxy</span>
              </div>
            )}
            {proxyStats && (
              <div className="flex items-center space-x-1 text-xs text-blue-400">
                <SafeIcon icon={FiShield} />
                <span>{proxyStats.activeProxies}/{proxyStats.totalProxies}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              {formatTime(sessionStats.timeSpent)}
            </div>
            {fingerprintGenerated && (
              <button
                onClick={toggleFingerprintType}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs flex items-center space-x-1"
                title="Switch Fingerprint & Proxy"
              >
                <SafeIcon icon={activeFingerprint === 'desktop' ? FiSmartphone : FiMonitor} />
                <SafeIcon icon={FiServer} />
                <span>Switch</span>
              </button>
            )}
            <button
              onClick={toggleAgentMode}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isBrowsing
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isBrowsing ? 'Pause Agent' : 'Start Agent'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Main Desktop Area */}
        <div className="w-full h-full pb-12 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          
          {/* Agent Status Panel */}
          <div className="absolute top-4 left-4 w-80 bg-black bg-opacity-80 rounded-lg p-4 text-white z-20">
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${isBrowsing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <h3 className="font-semibold">AI Agent Status</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiActivity} className="text-blue-400" />
                <span className="truncate">{currentAction}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Pages: {sessionStats.pagesVisited}</div>
                <div>Tabs: {sessionStats.tabsOpened}</div>
                <div>Searches: {sessionStats.searchQueries}</div>
                <div>Actions: {sessionStats.clickActions + sessionStats.scrollActions}</div>
                <div>Fingerprints: {sessionStats.fingerprintSwitches}</div>
                <div>Proxies: {sessionStats.proxyAssignments}</div>
                <div className="flex items-center space-x-1 col-span-2">
                  <SafeIcon icon={activeFingerprint === 'desktop' ? FiMonitor : FiSmartphone} className="text-purple-400" />
                  <span>{activeFingerprint}</span>
                  <SafeIcon icon={FiServer} className="text-blue-400" />
                  <span>proxy-enabled</span>
                </div>
              </div>
              
              {sessionPlan.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-300 mb-1">
                    Plan Progress: {currentPlanStep}/{sessionPlan.length}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentPlanStep / sessionPlan.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Proxy Status Panel */}
          {proxyStats && (
            <div className="absolute top-4 right-[400px] w-72 bg-black bg-opacity-80 rounded-lg p-4 text-white z-20">
              <div className="flex items-center space-x-2 mb-3">
                <SafeIcon icon={FiServer} className="text-blue-400" />
                <h3 className="font-semibold">Proxy Network</h3>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Total Proxies:</span>
                  <span className="text-blue-400">{proxyStats.totalProxies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="text-green-400">{proxyStats.activeProxies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="text-yellow-400">{proxyStats.availableProxies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blacklisted:</span>
                  <span className="text-red-400">{proxyStats.blacklistedProxies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Score:</span>
                  <span className="text-purple-400">{proxyStats.averageScore}/100</span>
                </div>
                <div className="mt-2">
                  <div className="text-gray-300 mb-1">Countries:</div>
                  <div className="flex flex-wrap gap-1">
                    {proxyStats.countries.map(country => (
                      <span key={country} className="px-1 py-0.5 bg-blue-600 rounded text-xs">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fingerprint & Proxy Panel */}
          {fingerprintGenerated && (
            <div className="absolute top-4 right-96 w-80 bg-black bg-opacity-80 rounded-lg p-4 text-white z-20">
              <div className="flex items-center space-x-2 mb-3">
                <SafeIcon icon={FiFingerprint} className="text-purple-400" />
                <SafeIcon icon={FiServer} className="text-blue-400" />
                <h3 className="font-semibold">Identity & Proxy</h3>
              </div>
              
              <div className="space-y-2 text-xs">
                {getCurrentFingerprint() && (
                  <>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={activeFingerprint === 'desktop' ? FiMonitor : FiSmartphone} className="text-purple-400" />
                      <span>{activeFingerprint.toUpperCase()}</span>
                    </div>
                    <div className="text-gray-300">
                      ID: {getCurrentFingerprint().id.slice(-12)}
                    </div>
                    <div className="text-gray-300">
                      Browser: {getCurrentFingerprint().browser.name} {getCurrentFingerprint().browser.version}
                    </div>
                    <div className="text-gray-300">
                      OS: {getCurrentFingerprint().system.os} {getCurrentFingerprint().system.version}
                    </div>
                    
                    {/* Proxy Information */}
                    {getCurrentFingerprint().proxy ? (
                      <>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="flex items-center space-x-1 text-blue-400 mb-1">
                            <SafeIcon icon={FiServer} />
                            <span>Proxy Active</span>
                          </div>
                          <div className="text-gray-300">
                            IP: {getCurrentFingerprint().proxy.ip}:{getCurrentFingerprint().proxy.port}
                          </div>
                          <div className="text-gray-300">
                            Type: {getCurrentFingerprint().proxy.type}
                          </div>
                          <div className="text-gray-300">
                            Provider: {getCurrentFingerprint().proxy.provider}
                          </div>
                          <div className="flex items-center space-x-1 text-gray-300">
                            <SafeIcon icon={FiMapPin} />
                            <span>{getCurrentFingerprint().proxy.location.city}, {getCurrentFingerprint().proxy.country}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiTrendingUp} className="text-green-400" />
                            <span className="text-green-400">Score: {getCurrentFingerprint().proxy.score.toFixed(1)}/100</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-yellow-400 flex items-center space-x-1">
                        <SafeIcon icon={FiServer} />
                        <span>Direct Connection</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Agent Thoughts Panel */}
          <div className="absolute top-4 right-4 w-80 bg-black bg-opacity-80 rounded-lg p-4 text-white z-20">
            <div className="flex items-center space-x-2 mb-3">
              <SafeIcon icon={FiZap} className="text-yellow-400" />
              <h3 className="font-semibold">Agent Thoughts</h3>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {agentThoughts.map((thought) => (
                <div key={thought.id} className="text-xs">
                  <div className="text-gray-400">{thought.timestamp}</div>
                  <div className="text-white">{thought.thought}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Window */}
          {showBrowser && (
            <div className={`absolute transition-all duration-500 bg-white rounded-lg shadow-2xl ${
              isMaximized 
                ? 'inset-4 bottom-16' 
                : 'top-20 left-1/2 transform -translate-x-1/2 w-5/6 h-4/5'
            }`}>
              
              {/* Browser Header */}
              <div className="flex items-center justify-between p-2 bg-gray-100 border-b rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Agent Browser</span>
                  {fingerprintGenerated && (
                    <div className="flex items-center space-x-1 text-xs text-purple-600">
                      <SafeIcon icon={FiFingerprint} />
                      <span>{activeFingerprint}</span>
                      <SafeIcon icon={FiServer} className="text-blue-600" />
                      <span>proxy</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <SafeIcon icon={isMaximized ? FiMinimize2 : FiMaximize2} />
                  </button>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex items-center bg-gray-50 border-b px-2">
                <div className="flex-1 flex items-center space-x-1 overflow-x-auto">
                  {tabs.map((tab, index) => (
                    <div
                      key={tab.id}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm border-r cursor-pointer min-w-0 ${
                        index === activeTab 
                          ? 'bg-white border-t-2 border-t-blue-500 text-gray-900' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => switchTab(index)}
                    >
                      {tab.isLoading && <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>}
                      <span className="truncate max-w-32">{tab.title}</span>
                      {tabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(index);
                          }}
                          className="hover:bg-gray-200 rounded-full p-1"
                        >
                          <SafeIcon icon={FiX} className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => openNewTab()}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="New Tab"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center space-x-2 p-2 bg-gray-50 border-b">
                <div className="flex items-center space-x-1">
                  <button 
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                    disabled={historyIndex <= 0}
                    onClick={() => {
                      if (historyIndex > 0) {
                        setHistoryIndex(prev => prev - 1);
                        navigateToUrl(browserHistory[historyIndex - 1]);
                      }
                    }}
                  >
                    <SafeIcon icon={FiArrowLeft} />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                    disabled={historyIndex >= browserHistory.length - 1}
                    onClick={() => {
                      if (historyIndex < browserHistory.length - 1) {
                        setHistoryIndex(prev => prev + 1);
                        navigateToUrl(browserHistory[historyIndex + 1]);
                      }
                    }}
                  >
                    <SafeIcon icon={FiArrowRight} />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-200 rounded"
                    onClick={() => navigateToUrl(addressBarValue)}
                  >
                    <SafeIcon icon={FiRefreshCw} />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-200 rounded"
                    onClick={() => navigateToUrl(campaign.targetUrl)}
                  >
                    <SafeIcon icon={FiHome} />
                  </button>
                </div>
                
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 flex items-center bg-white border rounded-full px-3 py-1">
                    <SafeIcon icon={addressBarValue.startsWith('https') ? FiLock : FiUnlock} className="text-green-500 mr-2" />
                    <input
                      type="text"
                      value={addressBarValue}
                      onChange={(e) => setAddressBarValue(e.target.value)}
                      onKeyPress={handleAddressBarKeyPress}
                      className="flex-1 outline-none text-sm"
                      placeholder="Enter URL or search..."
                    />
                    {getCurrentFingerprint()?.proxy && (
                      <div className="flex items-center space-x-1 ml-2 text-xs text-blue-600">
                        <SafeIcon icon={FiServer} />
                        <span>{getCurrentFingerprint().proxy.ip}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <SafeIcon icon={FiBookmark} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <SafeIcon icon={FiShare2} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <SafeIcon icon={FiMenu} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Browser Content */}
              <div className="relative flex-1 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={campaign.targetUrl}
                  className="w-full h-full border-0"
                  title={`Agent browsing: ${campaign.name}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-navigation"
                  onLoad={() => {
                    setIsLoading(false);
                    addAgentThought('✅ Page loaded successfully via proxy');
                  }}
                />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading page via proxy...</p>
                      <p className="text-sm text-gray-500">Agent analyzing content</p>
                      {getCurrentFingerprint()?.proxy && (
                        <p className="text-xs text-blue-600 mt-1">
                          Via {getCurrentFingerprint().proxy.ip} ({getCurrentFingerprint().proxy.type})
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Agent Activity Indicator */}
                {isBrowsing && !isLoading && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse flex items-center space-x-2">
                    <SafeIcon icon={FiActivity} />
                    <span>AI Agent Active</span>
                    {fingerprintGenerated && (
                      <>
                        <SafeIcon icon={activeFingerprint === 'desktop' ? FiMonitor : FiSmartphone} />
                        <SafeIcon icon={FiServer} />
                        <span>{activeFingerprint}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Icons */}
          {showDesktop && !showBrowser && (
            <div className="absolute top-8 left-8 space-y-4">
              <div 
                className="flex flex-col items-center space-y-2 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg p-3 transition-colors"
                onClick={() => setShowBrowser(true)}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiGlobe} className="text-white text-2xl" />
                </div>
                <span className="text-white text-sm">Browser</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioWindow;
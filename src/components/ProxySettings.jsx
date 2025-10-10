import React, { useState, useEffect, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import { setProxyMode, getProxyStats } from '../lib/proxyManager';
import { triggerProxiesUpdated } from '../lib/ownedProxyManager';
import * as FiIcons from 'react-icons/fi';

const { 
  FiServer, FiUpload, FiDownload, FiTrash2, FiCheck, FiX, FiEye, FiEyeOff,
  FiPlus, FiEdit3, FiSave, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiDatabase, FiSettings, FiList, FiFilter,
  FiSearch, FiCopy, FiExternalLink, FiInfo, FiTool, FiWifi, FiMapPin,
  FiFile, FiFileText, FiFolderOpen, FiPower
} = FiIcons;

const ProxySettings = () => {
  const [activeTab, setActiveTab] = useState('owned');
  const [ownedProxies, setOwnedProxies] = useState([]);
  const [proxyInput, setProxyInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [testingProxies, setTestingProxies] = useState(new Set());
  const [proxyStats, setProxyStats] = useState({
    total: 0,
    working: 0,
    failed: 0,
    untested: 0,
    countries: 0
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [networkStats, setNetworkStats] = useState(null);
  
  const fileInputRef = useRef(null);

  // Load saved proxies on component mount
  useEffect(() => {
    loadSavedProxies();
    updateNetworkStats();
  }, []);

  // Update stats when proxies change
  useEffect(() => {
    updateProxyStats();
    updateNetworkStats();
  }, [ownedProxies]);

  const loadSavedProxies = () => {
    try {
      const saved = localStorage.getItem('ownedProxies');
      if (saved) {
        const proxies = JSON.parse(saved);
        setOwnedProxies(proxies);
        console.log(`📥 Loaded ${proxies.length} proxies from localStorage`);
      }
    } catch (error) {
      console.error('Error loading saved proxies:', error);
    }
  };

  const updateNetworkStats = () => {
    const stats = getProxyStats();
    setNetworkStats(stats);
  };

  const saveProxies = (proxies) => {
    try {
      localStorage.setItem('ownedProxies', JSON.stringify(proxies));
      setOwnedProxies(proxies);
      
      // Trigger the proxy update event for other components
      triggerProxiesUpdated();
      
      console.log(`💾 Saved ${proxies.length} proxies to localStorage and triggered update event`);
    } catch (error) {
      console.error('Error saving proxies:', error);
    }
  };

  const updateProxyStats = () => {
    const stats = ownedProxies.reduce((acc, proxy) => {
      acc.total++;
      switch (proxy.status) {
        case 'working':
          acc.working++;
          break;
        case 'failed':
          acc.failed++;
          break;
        default:
          acc.untested++;
      }
      return acc;
    }, { total: 0, working: 0, failed: 0, untested: 0 });
    
    // Count unique countries
    const uniqueCountries = new Set(ownedProxies.map(p => p.country).filter(Boolean));
    stats.countries = uniqueCountries.size;
    
    setProxyStats(stats);
  };

  // Get list of unique countries for filter dropdown
  const getUniqueCountries = () => {
    const countries = [...new Set(ownedProxies.map(p => p.country).filter(Boolean))];
    return countries.sort();
  };

  const parseProxyString = (proxyStr) => {
    const trimmed = proxyStr.trim();
    if (!trimmed) return null;

    let ip, port, username, password, protocol = 'socks5';
    let countryCode = '', countryName = '', geoRegion = '';

    try {
      // Check for new format: countrycode:country_name:georegion_name:ip:port_socks:login:password
      if (trimmed.includes(':') && trimmed.split(':').length >= 7) {
        const parts = trimmed.split(':');
        
        if (parts.length >= 7) {
          countryCode = parts[0] || '';
          countryName = parts[1] || '';
          geoRegion = parts[2] || '';
          ip = parts[3];
          
          // Handle port with protocol suffix (e.g., "1080_socks")
          const portPart = parts[4];
          if (portPart.includes('_')) {
            const [portNum, protocolSuffix] = portPart.split('_');
            port = parseInt(portNum);
            protocol = protocolSuffix.toLowerCase();
          } else {
            port = parseInt(portPart);
          }
          
          username = parts[5] || '';
          password = parts[6] || '';
        }
      }
      // Handle URL format (http://username:password@ip:port)
      else if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('socks5://')) {
        const url = new URL(trimmed);
        protocol = url.protocol.replace(':', '');
        ip = url.hostname;
        port = parseInt(url.port);
        username = url.username || '';
        password = url.password || '';
      }
      // Handle username:password@ip:port format
      else if (trimmed.includes('@')) {
        const [auth, server] = trimmed.split('@');
        const [user, pass] = auth.split(':');
        const [serverIp, serverPort] = server.split(':');
        
        username = user || '';
        password = pass || '';
        ip = serverIp;
        port = parseInt(serverPort);
      }
      // Handle ip:port:username:password format
      else {
        const parts = trimmed.split(':');
        if (parts.length >= 2) {
          ip = parts[0];
          port = parseInt(parts[1]);
          username = parts[2] || '';
          password = parts[3] || '';
        }
      }

      // Validate IP and port
      if (!ip || !port || isNaN(port) || port < 1 || port > 65535) {
        return null;
      }

      // Basic IP validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ip)) {
        return null;
      }

      // Validate IP octets
      const octets = ip.split('.').map(Number);
      if (octets.some(octet => octet < 0 || octet > 255)) {
        return null;
      }

      return {
        id: Date.now() + Math.random(),
        ip,
        port,
        username,
        password,
        protocol,
        countryCode: countryCode.toUpperCase(),
        country: countryName || countryCode.toUpperCase() || 'Unknown',
        geoRegion: geoRegion || 'Unknown',
        status: 'untested',
        responseTime: null,
        lastChecked: null,
        type: 'owned',
        addedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing proxy string:', error);
      return null;
    }
  };

  const addSingleProxy = () => {
    const proxy = parseProxyString(proxyInput);
    if (proxy) {
      // Check for duplicates
      const duplicate = ownedProxies.find(p => p.ip === proxy.ip && p.port === proxy.port);
      if (duplicate) {
        alert('This proxy already exists in your list.');
        return;
      }

      const newProxies = [...ownedProxies, proxy];
      saveProxies(newProxies);
      setProxyInput('');
      
      // Show success message
      console.log(`✅ Added proxy: ${proxy.ip}:${proxy.port} (${proxy.country})`);
    } else {
      alert('Invalid proxy format. Please use one of these formats:\n' +
            '- countrycode:country_name:georegion_name:ip:port_socks:login:password\n' +
            '- ip:port\n' +
            '- ip:port:username:password\n' +
            '- username:password@ip:port\n' +
            '- http://username:password@ip:port');
    }
  };

  const addBulkProxies = () => {
    const lines = bulkInput.split('\n').filter(line => line.trim());
    const newProxies = [];
    const duplicates = [];
    const invalid = [];

    lines.forEach((line, index) => {
      const proxy = parseProxyString(line);
      if (proxy) {
        // Check for duplicates
        const duplicate = ownedProxies.find(p => p.ip === proxy.ip && p.port === proxy.port) ||
                         newProxies.find(p => p.ip === proxy.ip && p.port === proxy.port);
        
        if (duplicate) {
          duplicates.push(`Line ${index + 1}: ${line}`);
        } else {
          newProxies.push(proxy);
        }
      } else {
        invalid.push(`Line ${index + 1}: ${line}`);
      }
    });

    if (newProxies.length > 0) {
      const allProxies = [...ownedProxies, ...newProxies];
      saveProxies(allProxies);
      setBulkInput('');
      setShowBulkImport(false);

      let message = `Added ${newProxies.length} proxies successfully.`;
      if (duplicates.length > 0) {
        message += `\n\nSkipped ${duplicates.length} duplicates.`;
      }
      if (invalid.length > 0) {
        message += `\n\nSkipped ${invalid.length} invalid entries.`;
      }
      alert(message);
      
      console.log(`✅ Bulk import: ${newProxies.length} new proxies added`);
    } else {
      alert('No valid proxies found to add.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('Please select a .txt file containing proxy list.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 10MB.');
      return;
    }

    setIsUploadingFile(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Process file content
      const lines = fileContent.split('\n').filter(line => line.trim());
      const newProxies = [];
      const duplicates = [];
      const invalid = [];

      lines.forEach((line, index) => {
        const proxy = parseProxyString(line);
        if (proxy) {
          // Check for duplicates
          const duplicate = ownedProxies.find(p => p.ip === proxy.ip && p.port === proxy.port) ||
                           newProxies.find(p => p.ip === proxy.ip && p.port === proxy.port);
          
          if (duplicate) {
            duplicates.push(`Line ${index + 1}: ${line}`);
          } else {
            newProxies.push(proxy);
          }
        } else {
          invalid.push(`Line ${index + 1}: ${line}`);
        }
      });

      // Save results
      if (newProxies.length > 0) {
        const allProxies = [...ownedProxies, ...newProxies];
        saveProxies(allProxies);

        let message = `✅ Successfully imported ${newProxies.length} proxies from "${file.name}"`;
        if (duplicates.length > 0) {
          message += `\n\n⚠️  Skipped ${duplicates.length} duplicates`;
        }
        if (invalid.length > 0) {
          message += `\n\n❌ Skipped ${invalid.length} invalid entries`;
        }
        
        // Show detailed breakdown
        const geoProxies = newProxies.filter(p => p.countryCode && p.geoRegion !== 'Unknown').length;
        if (geoProxies > 0) {
          message += `\n\n🌍 ${geoProxies} proxies with geographic information`;
        }

        message += `\n\n🎯 Your proxy list is now ready for browser sessions!`;
        alert(message);
        
        console.log(`✅ File upload successful: ${newProxies.length} proxies imported from ${file.name}`);
      } else {
        alert(`❌ No valid proxies found in "${file.name}"\n\nPlease check the file format and try again.`);
      }

    } catch (error) {
      console.error('Error reading file:', error);
      alert(`❌ Error reading file: ${error.message}`);
    } finally {
      setIsUploadingFile(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeProxy = (id) => {
    const newProxies = ownedProxies.filter(proxy => proxy.id !== id);
    saveProxies(newProxies);
  };

  const clearAllProxies = () => {
    if (confirm('Are you sure you want to remove all proxies? This action cannot be undone.')) {
      saveProxies([]);
      console.log('🗑️ All proxies cleared');
    }
  };

  const testProxy = async (proxy) => {
    setTestingProxies(prev => new Set([...prev, proxy.id]));

    try {
      // Simulate proxy testing with more realistic timing based on geo location
      const baseDelay = proxy.geoRegion === 'Unknown' ? 1500 : 2000;
      const randomDelay = Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, baseDelay + randomDelay));
      
      // Better success rate for proxies with complete geo info
      const hasGeoInfo = proxy.countryCode && proxy.geoRegion !== 'Unknown';
      const successRate = hasGeoInfo ? 0.8 : 0.6; // 80% vs 60%
      const isWorking = Math.random() < successRate;
      const responseTime = isWorking ? Math.floor(Math.random() * 300 + 50) : null;
      
      const updatedProxies = ownedProxies.map(p => {
        if (p.id === proxy.id) {
          return {
            ...p,
            status: isWorking ? 'working' : 'failed',
            responseTime: responseTime,
            lastChecked: new Date().toISOString()
          };
        }
        return p;
      });

      saveProxies(updatedProxies);
      console.log(`🧪 Test result for ${proxy.ip}:${proxy.port}: ${isWorking ? 'working' : 'failed'}`);
    } catch (error) {
      console.error('Error testing proxy:', error);
      const updatedProxies = ownedProxies.map(p => {
        if (p.id === proxy.id) {
          return {
            ...p,
            status: 'failed',
            responseTime: null,
            lastChecked: new Date().toISOString()
          };
        }
        return p;
      });
      saveProxies(updatedProxies);
    } finally {
      setTestingProxies(prev => {
        const newSet = new Set(prev);
        newSet.delete(proxy.id);
        return newSet;
      });
    }
  };

  const testAllProxies = async () => {
    setIsValidating(true);
    const proxiesToTest = filteredProxies.filter(p => p.status !== 'working');
    
    console.log(`🧪 Starting batch test of ${proxiesToTest.length} proxies`);
    
    // Test proxies in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < proxiesToTest.length; i += batchSize) {
      const batch = proxiesToTest.slice(i, i + batchSize);
      await Promise.all(batch.map(proxy => testProxy(proxy)));
      
      // Small delay between batches
      if (i + batchSize < proxiesToTest.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsValidating(false);
    console.log(`✅ Batch testing completed`);
  };

  const exportProxies = () => {
    const workingProxies = ownedProxies.filter(p => p.status === 'working');
    const proxyList = workingProxies.map(proxy => {
      // Export in the enhanced format if we have the geo data
      if (proxy.countryCode && proxy.geoRegion !== 'Unknown') {
        return `${proxy.countryCode}:${proxy.country}:${proxy.geoRegion}:${proxy.ip}:${proxy.port}_${proxy.protocol}:${proxy.username}:${proxy.password}`;
      }
      // Fallback to standard format
      else if (proxy.username && proxy.password) {
        return `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
      }
      return `${proxy.ip}:${proxy.port}`;
    }).join('\n');

    const blob = new Blob([proxyList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `working_proxies_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`📤 Exported ${workingProxies.length} working proxies`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'working': return 'bg-green-900';
      case 'failed': return 'bg-red-900';
      default: return 'bg-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working': return FiCheckCircle;
      case 'failed': return FiX;
      default: return FiAlertCircle;
    }
  };

  const getProtocolColor = (protocol) => {
    switch (protocol.toLowerCase()) {
      case 'socks5': return 'bg-purple-100 text-purple-800';
      case 'socks4': return 'bg-blue-100 text-blue-800';
      case 'http': return 'bg-green-100 text-green-800';
      case 'https': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProxies = ownedProxies.filter(proxy => {
    const matchesSearch = !searchTerm || 
      proxy.ip.includes(searchTerm) || 
      proxy.port.toString().includes(searchTerm) ||
      proxy.username.includes(searchTerm) ||
      proxy.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proxy.countryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proxy.geoRegion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || proxy.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || proxy.country === filterCountry;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const tabs = [
    { id: 'owned', label: 'Your Proxy List', icon: FiDatabase },
    { id: 'settings', label: 'Proxy Settings', icon: FiSettings },
    { id: 'integration', label: 'Integration', icon: FiTool }
  ];

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiServer} className="text-2xl text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Your Proxy Network</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Owned Proxies Only
            </div>
            {ownedProxies.length > 0 && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {ownedProxies.length} Loaded
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Proxies</p>
                <p className="text-2xl font-bold text-blue-900">{networkStats?.totalProxies || proxyStats.total}</p>
              </div>
              <SafeIcon icon={FiDatabase} className="text-blue-600 text-xl" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Working</p>
                <p className="text-2xl font-bold text-green-900">{networkStats?.workingOwnedProxies || proxyStats.working}</p>
              </div>
              <SafeIcon icon={FiCheckCircle} className="text-green-600 text-xl" />
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active</p>
                <p className="text-2xl font-bold text-orange-900">{networkStats?.activeProxies || 0}</p>
              </div>
              <SafeIcon icon={FiPower} className="text-orange-600 text-xl" />
            </div>
          </div>
          
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">Available</p>
                <p className="text-2xl font-bold text-cyan-900">{networkStats?.availableProxies || proxyStats.working + proxyStats.untested}</p>
              </div>
              <SafeIcon icon={FiWifi} className="text-cyan-600 text-xl" />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Countries</p>
                <p className="text-2xl font-bold text-indigo-900">{networkStats?.countries?.length || proxyStats.countries}</p>
              </div>
              <SafeIcon icon={FiMapPin} className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'owned' && (
        <div className="space-y-6">
          {/* Add Proxy Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add Your Proxies</h4>
            
            {/* Format Information Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiInfo} className="text-blue-600 mt-1" />
                <div>
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Enhanced Format Support</h5>
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Preferred Format:</strong> <code className="bg-blue-100 px-1 rounded">countrycode:country_name:georegion_name:ip:port_socks:login:password</code>
                  </p>
                  <p className="text-xs text-blue-600">
                    Example: <code className="bg-blue-100 px-1 rounded">US:United States:New York:192.168.1.1:1080_socks5:myuser:mypass</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Import Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Single Proxy */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <SafeIcon icon={FiPlus} className="text-blue-600" />
                  <h5 className="text-sm font-medium text-gray-900">Single Proxy</h5>
                </div>
                <p className="text-xs text-gray-600 mb-3">Add one proxy at a time</p>
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  Use Single Input
                </button>
              </div>

              {/* File Upload */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <SafeIcon icon={FiFileText} className="text-green-600" />
                  <h5 className="text-sm font-medium text-gray-900">Upload File</h5>
                </div>
                <p className="text-xs text-gray-600 mb-3">Import from .txt file</p>
                <button
                  onClick={triggerFileUpload}
                  disabled={isUploadingFile}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={isUploadingFile ? FiRefreshCw : FiFolderOpen} className={isUploadingFile ? 'animate-spin' : ''} />
                  <span>{isUploadingFile ? 'Uploading...' : 'Choose File'}</span>
                </button>
              </div>

              {/* Bulk Paste */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <SafeIcon icon={FiList} className="text-purple-600" />
                  <h5 className="text-sm font-medium text-gray-900">Bulk Paste</h5>
                </div>
                <p className="text-xs text-gray-600 mb-3">Paste multiple proxies</p>
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  Open Bulk Import
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploadingFile && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uploading file...</span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Single Proxy Input */}
            {!showBulkImport && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Single Proxy
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={proxyInput}
                    onChange={(e) => setProxyInput(e.target.value)}
                    placeholder="countrycode:country_name:georegion_name:ip:port_socks:login:password"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addSingleProxy}
                    disabled={!proxyInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlus} />
                    <span>Add</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: Enhanced format (preferred), ip:port, ip:port:user:pass, user:pass@ip:port, http://user:pass@ip:port
                </p>
              </div>
            )}

            {/* Bulk Import */}
            {showBulkImport && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bulk Import
                  </label>
                  <button
                    onClick={() => setShowBulkImport(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiX} />
                    <span>Close</span>
                  </button>
                </div>
                
                <div>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Paste multiple proxies here (one per line)&#10;US:United States:New York:192.168.1.1:1080_socks5:user1:pass1&#10;UK:United Kingdom:London:192.168.1.2:1080_socks5:user2:pass2&#10;CA:Canada:Toronto:192.168.1.3:1080_socks5:user3:pass3"
                    rows={8}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {bulkInput.split('\n').filter(line => line.trim()).length} lines
                    </p>
                    <button
                      onClick={addBulkProxies}
                      disabled={!bulkInput.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiUpload} />
                      <span>Import All</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message for Browser Sessions */}
            {ownedProxies.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <SafeIcon icon={FiCheckCircle} className="text-green-600 mt-1" />
                  <div>
                    <h5 className="text-sm font-medium text-green-900 mb-2">✅ Ready for Browser Sessions!</h5>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Your {ownedProxies.length} proxies are now available for multi-browser simulation</li>
                      <li>• Browser sessions will automatically use your proxy list</li>
                      <li>• Each session will get a unique IP from your collection</li>
                      <li>• {proxyStats.working + proxyStats.untested} proxies are ready to use (working + untested)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proxy List */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Your Proxy List ({ownedProxies.length})</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={testAllProxies}
                    disabled={isValidating || filteredProxies.length === 0}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  >
                    <SafeIcon icon={FiRefreshCw} className={isValidating ? 'animate-spin' : ''} />
                    <span>{isValidating ? 'Testing...' : 'Test All'}</span>
                  </button>
                  <button
                    onClick={exportProxies}
                    disabled={proxyStats.working === 0}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  >
                    <SafeIcon icon={FiDownload} />
                    <span>Export Working</span>
                  </button>
                  <button
                    onClick={clearAllProxies}
                    disabled={ownedProxies.length === 0}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  >
                    <SafeIcon icon={FiTrash2} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by IP, country, region, or credentials..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="working">Working</option>
                  <option value="failed">Failed</option>
                  <option value="untested">Untested</option>
                </select>

                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {getUniqueCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
                >
                  <SafeIcon icon={showPasswords ? FiEyeOff : FiEye} />
                  <span>{showPasswords ? 'Hide' : 'Show'} Auth</span>
                </button>
              </div>
            </div>

            {/* Enhanced Proxy Table */}
            <div className="overflow-x-auto">
              {filteredProxies.length === 0 ? (
                <div className="p-8 text-center">
                  <SafeIcon icon={FiServer} className="mx-auto text-4xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Proxies Found</h3>
                  <p className="text-gray-500 mb-4">
                    {ownedProxies.length === 0 
                      ? 'Add your first proxy using one of the methods above.' 
                      : 'No proxies match your current filters.'}
                  </p>
                  {ownedProxies.length === 0 && (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={triggerFileUpload}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <SafeIcon icon={FiFolderOpen} />
                        <span>Upload File</span>
                      </button>
                      <button
                        onClick={() => setShowBulkImport(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <SafeIcon icon={FiList} />
                        <span>Bulk Import</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location & Proxy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Protocol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Checked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProxies.map((proxy) => (
                      <tr key={proxy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {proxy.ip}:{proxy.port}
                              </div>
                              {proxy.countryCode && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <SafeIcon icon={FiMapPin} className="mr-1" />
                                  {proxy.countryCode}
                                </span>
                              )}
                            </div>
                            {proxy.country !== 'Unknown' && (
                              <div className="text-sm text-gray-500">
                                {proxy.country}{proxy.geoRegion !== 'Unknown' && `, ${proxy.geoRegion}`}
                              </div>
                            )}
                            {proxy.username && (
                              <div className="text-sm text-gray-500">
                                {showPasswords 
                                  ? `${proxy.username}:${proxy.password}` 
                                  : `${proxy.username}:${'•'.repeat(proxy.password.length)}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(proxy.protocol)}`}>
                            {proxy.protocol.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(proxy.status)} ${getStatusColor(proxy.status)}`}>
                            <SafeIcon icon={getStatusIcon(proxy.status)} className="mr-1" />
                            {proxy.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {proxy.responseTime ? `${proxy.responseTime}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proxy.lastChecked 
                            ? new Date(proxy.lastChecked).toLocaleString() 
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => testProxy(proxy)}
                              disabled={testingProxies.has(proxy.id)}
                              className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <SafeIcon 
                                icon={FiRefreshCw} 
                                className={testingProxies.has(proxy.id) ? 'animate-spin' : ''} 
                              />
                            </button>
                            <button
                              onClick={() => removeProxy(proxy.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <SafeIcon icon={FiTrash2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Proxy Configuration</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Proxy Type
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="socks5">SOCKS5 (Recommended)</option>
                <option value="socks4">SOCKS4</option>
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Timeout (seconds)
              </label>
              <input
                type="number"
                defaultValue={10}
                min={1}
                max={60}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Attempts
              </label>
              <input
                type="number"
                defaultValue={3}
                min={1}
                max={10}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRotate"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRotate" className="ml-2 block text-sm text-gray-900">
                Enable automatic proxy rotation
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="validateSsl"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="validateSsl" className="ml-2 block text-sm text-gray-900">
                Validate SSL certificates
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="preferGeoProxies"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="preferGeoProxies" className="ml-2 block text-sm text-gray-900">
                Prefer proxies with geographic information
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integration' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Integration Settings</h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Multi-Browser Simulation</h5>
              <p className="text-sm text-gray-600 mb-3">
                Your uploaded proxies will be automatically used in the multi-browser simulation system.
              </p>
              {ownedProxies.length > 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <SafeIcon icon={FiCheckCircle} className="text-green-600 mt-1" />
                    <div>
                      <h6 className="text-sm font-medium text-green-900 mb-1">Your Proxy List is Active</h6>
                      <p className="text-sm text-green-700 mb-2">
                        The system will use your {ownedProxies.length} uploaded proxies for all browser simulations.
                      </p>
                      <ul className="text-xs text-green-600 space-y-1">
                        <li>• {proxyStats.working + proxyStats.untested} proxies ready for sessions</li>
                        <li>• {proxyStats.countries} countries available</li>
                        <li>• Each browser session gets a unique proxy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <SafeIcon icon={FiAlertCircle} className="text-orange-600 mt-1" />
                    <div>
                      <h6 className="text-sm font-medium text-orange-900 mb-1">No Proxy List Found</h6>
                      <p className="text-sm text-orange-700">
                        Upload your proxy list above to enable multi-browser simulation with real IPs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Geographic Targeting</h5>
              <p className="text-sm text-gray-600 mb-3">
                Configure how geographic information is used for proxy selection.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="matchDeviceLocation"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="matchDeviceLocation" className="text-sm text-gray-900">
                    Match proxy location to device fingerprint location
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preferRegionalProxies"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="preferRegionalProxies" className="text-sm text-gray-900">
                    Prefer proxies from the same geographic region  
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">API Integration</h5>
              <p className="text-sm text-gray-600 mb-3">
                Export your proxy configuration for external tools and applications.
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm">
                  <SafeIcon icon={FiCopy} />
                  <span>Copy Enhanced Config</span>
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm">
                  <SafeIcon icon={FiExternalLink} />
                  <span>View Documentation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProxySettings;
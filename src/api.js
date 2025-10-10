import { API_BASE, API_KEY, getServerConfig, updateServerStatusCache } from './config';

// Helper function to get current server configuration
const getCurrentServerConfig = () => {
  return getServerConfig();
};

// Helper function to get API headers
const getApiHeaders = (apiKey = null) => {
  const key = apiKey || API_KEY;
  
  const headers = { 
    'Content-Type': 'application/json'
  };
  
  if (key) {
    headers['x-api-key'] = key;
    headers['Authorization'] = `Bearer ${key}`;
  }
  
  return headers;
};

// Helper function to build API URL
const getApiUrl = (serverConfig = null) => {
  if (serverConfig && serverConfig.host) {
    const protocol = serverConfig.useHttps ? 'https' : 'http';
    return `${protocol}://${serverConfig.host}:${serverConfig.port}`;
  }
  
  return API_BASE;
};

// Validate server configuration
export function validateServerConfig(config) {
  const errors = [];
  
  if (!config.host || config.host.trim() === '') {
    errors.push('Host/IP address is required');
  }
  
  if (!config.port || config.port.trim() === '') {
    errors.push('Port is required');
  } else if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('Port must be a valid number between 1 and 65535');
  }
  
  if (!config.apiKey || config.apiKey.trim() === '') {
    errors.push('API key is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get server URL from config
export function getServerUrl(config) {
  const protocol = config.useHttps ? 'https' : 'http';
  return `${protocol}://${config.host}:${config.port}`;
}

// Enhanced fetch with better error handling
const apiRequest = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    console.log(`🌐 API Request: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage += ` - ${errorJson.error || errorJson.message || errorText}`;
          } catch {
            errorMessage += ` - ${errorText}`;
          }
        }
      } catch (e) {
        // Ignore if we can't read error text
      }
      
      throw new Error(errorMessage);
    }

    // Try to parse as JSON, fallback to text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } else {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log(`✅ API Response (parsed):`, data);
        return data;
      } catch (e) {
        console.log(`✅ API Response (text):`, text);
        return { message: text, success: true };
      }
    }

  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error(`❌ API Request failed:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - VPS server not responding within 15 seconds');
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      throw new Error('Network error - cannot connect to VPS server. Check if server is running and accessible.');
    }
    
    throw error;
  }
};

// API Functions
export async function startCampaign(data, serverConfig = null) {
  const apiUrl = getApiUrl(serverConfig);
  
  return await apiRequest(`${apiUrl}/run`, {
    method: "POST",
    headers: getApiHeaders(serverConfig?.apiKey),
    body: JSON.stringify(data)
  });
}

export async function checkCampaignStatus(jobId, serverConfig = null) {
  const apiUrl = getApiUrl(serverConfig);
  
  return await apiRequest(`${apiUrl}/status/${jobId}`, {
    method: "GET",
    headers: getApiHeaders(serverConfig?.apiKey)
  });
}

export async function getCampaignResults(jobId, serverConfig = null) {
  const apiUrl = getApiUrl(serverConfig);
  
  return await apiRequest(`${apiUrl}/results/${jobId}`, {
    method: "GET",
    headers: getApiHeaders(serverConfig?.apiKey)
  });
}

export async function stopCampaign(jobId, serverConfig = null) {
  const apiUrl = getApiUrl(serverConfig);
  
  return await apiRequest(`${apiUrl}/stop/${jobId}`, {
    method: "POST",
    headers: getApiHeaders(serverConfig?.apiKey)
  });
}

export async function checkServerHealth(serverConfig = null) {
  const apiUrl = getApiUrl(serverConfig);
  
  // Try multiple health check endpoints
  const healthEndpoints = ['/health', '/ping', '/status'];
  
  for (const endpoint of healthEndpoints) {
    try {
      const result = await apiRequest(`${apiUrl}${endpoint}`, {
        method: "GET",
        headers: endpoint === '/health' ? {} : getApiHeaders(serverConfig?.apiKey)
      });
      
      // Update cache
      updateServerStatusCache('vps', true);
      
      return { 
        status: 'online', 
        endpoint,
        data: result,
        serverType: 'VPS Remote',
        serverUrl: apiUrl,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log(`Health check failed for ${apiUrl}${endpoint}:`, error.message);
    }
  }
  
  // Update cache for failed server
  updateServerStatusCache('vps', false);
  
  throw new Error(`All health check endpoints failed - VPS server at ${apiUrl} appears to be offline`);
}

// Test VPS server only
export async function testVPSServer() {
  try {
    const result = await apiRequest(`${API_BASE}/health`, {
      method: 'GET',
      headers: {}
    });
    
    updateServerStatusCache('vps', true);
    
    return {
      success: true,
      data: result,
      serverUrl: API_BASE,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    updateServerStatusCache('vps', false);
    
    return {
      success: false,
      error: error.message,
      serverUrl: API_BASE,
      timestamp: new Date().toISOString()
    };
  }
}

// Get list of campaigns
export async function getCampaigns(serverConfig = null) {
  const apiUrl = getApiUrl(serverConfig);
  
  return await apiRequest(`${apiUrl}/campaigns`, {
    method: "GET",
    headers: getApiHeaders(serverConfig?.apiKey)
  });
}

// Utility functions
export function buildCampaignRequest({
  urls,
  dwellMs = 8000,
  scroll = true,
  advancedSettings = {},
  user = null
}) {
  const sessionId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    urls: Array.isArray(urls) ? urls : urls.split('\n').map(s => s.trim()).filter(Boolean),
    dwellMs,
    scroll,
    targetUrl: Array.isArray(urls) ? urls[0] : urls.split('\n')[0]?.trim(),
    sessionId,
    userId: user?.id || 'guest',
    userEmail: user?.email || 'guest@localhost',
    timestamp: new Date().toISOString(),
    ...advancedSettings
  };
}

// Enhanced error handling helper
export function handleApiError(error, context = 'API operation') {
  console.error(`${context} failed:`, error);
  
  if (error.message.includes('timeout')) {
    return `Connection timeout: VPS server is not responding. Please check if your VPS server is running.`;
  }
  
  if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
    return `Network error: Cannot connect to VPS server. Check if server is running and accessible at ${API_BASE}.`;
  }
  
  if (error.message.includes('CORS')) {
    return `CORS error: VPS server is blocking requests. Make sure CORS is properly configured on your server.`;
  }
  
  if (error.message.includes('404')) {
    return `Not found: The requested endpoint was not found on the VPS server.`;
  }
  
  if (error.message.includes('401') || error.message.includes('403')) {
    return `Authentication error: Please check your API key configuration.`;
  }
  
  if (error.message.includes('500')) {
    return `Server error: The VPS server encountered an internal error.`;
  }
  
  return error.message || 'An unexpected error occurred while connecting to VPS server';
}

// Server info utility
export function getCurrentServerInfo() {
  return {
    type: 'VPS Remote',
    url: API_BASE,
    host: '67.217.60.57',
    port: '3000'
  };
}

// Get server status cache - exported for external use
export { getServerStatusCache } from './config';

// Default export with all functions
export default {
  startCampaign,
  checkCampaignStatus,
  getCampaignResults,
  stopCampaign,
  checkServerHealth,
  testVPSServer,
  getCampaigns,
  buildCampaignRequest,
  handleApiError,
  getCurrentServerInfo,
  validateServerConfig,
  getServerUrl
};
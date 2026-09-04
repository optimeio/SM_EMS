import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return 'http://localhost:5000/api';
    }

    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
    }

    // Default for production custom domain deployment (Hostinger, VPS, etc.)
    return `${window.location.origin}/api`;
  }
  return '/api';
};

const baseURL = getApiBaseUrl();

const API = axios.create({
  baseURL,
  timeout: 30000,
});

// Fast In-Memory Cache for Instant 0ms Tab Switching
const cacheMap = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

// Add auth token to requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  // Instant Cache Lookup for GET requests
  if (config.method === 'get' && !config.skipCache) {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cached = cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: config.headers,
        config,
        request: {}
      });
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to store fresh GET responses into cache and clear on mutations
API.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method === 'get' && !response.config.skipCache) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      cacheMap.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
      cacheMap.clear();
    }
    return response;
  },
  (error) => {
    if (error.response && !error.config?.url?.includes('/canva')) {
      if (error.response.status === 401 || error.response.status === 403) {
        if (window.location.pathname.startsWith('/admin')) {
          localStorage.removeItem('userInfo');
          alert('Admin Session Expired or Unauthorized: Please log in as Admin (admin@company.com).');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Clear cache helper when creating/updating/deleting records
export const clearApiCache = () => {
  cacheMap.clear();
};

// Keep-Alive auto-ping to keep free Render backend active 24/7
if (typeof window !== 'undefined') {
  setInterval(() => {
    fetch(`${baseURL.replace('/api', '')}/health`).catch(() => {});
  }, 3 * 60 * 1000); // Ping every 3 minutes
}

export default API;

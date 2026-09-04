import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      if (!envUrl || envUrl.includes('onrender.com')) {
        return 'http://localhost:5000/api';
      }
      return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
    }
  }
  const rawApiUrl = envUrl || 'https://ems-euvq.onrender.com/api';
  return rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
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

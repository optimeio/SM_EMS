import axios from 'axios';

// Production backend URL (Render) - called directly from browser
const RENDER_BACKEND = 'https://sm-ems.onrender.com/api';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      return 'http://localhost:5000/api';
    }

    // In production (Hostinger), call Render backend directly
    // Hostinger shared hosting does not support mod_proxy
    return RENDER_BACKEND;
  }
  return RENDER_BACKEND;
};

const baseURL = getApiBaseUrl();


// In-Memory Fast Cache Store & In-Flight Request Deduplication
const apiCache = new Map();
const pendingRequests = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache validity

export const clearApiCache = (pattern) => {
  if (!pattern) {
    apiCache.clear();
  } else {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  }
};

// Target invalidation by endpoint area
const invalidateRelatedCaches = (url = '') => {
  if (url.includes('/employees')) {
    clearApiCache('/employees');
    clearApiCache('/dashboard');
    clearApiCache('/performance');
  } else if (url.includes('/attendance')) {
    clearApiCache('/attendance');
    clearApiCache('/dashboard');
  } else if (url.includes('/tasks')) {
    clearApiCache('/tasks');
    clearApiCache('/dashboard');
    clearApiCache('/performance');
  } else {
    clearApiCache();
  }
};

const API = axios.create({
  baseURL,
  timeout: 90000, // 90s allows free-tier cloud instances (Render) to finish cold starting
});

// Cache key helper
const getCacheKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}:${params}`;
};

// Add auth token to requests, check fast cache, and deduplicate in-flight requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  // Fast In-Memory Cache for GET requests
  const method = (config.method || 'get').toLowerCase();
  const skipCache = config.headers?.['x-skip-cache'] === 'true' || config.params?.skipCache;

  if (method === 'get' && !skipCache) {
    const key = getCacheKey(config);
    const cached = apiCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      config.__fromCache = true;
      config.adapter = async () => ({
        data: JSON.parse(JSON.stringify(cached.data)),
        status: 200,
        statusText: 'OK',
        headers: { ...cached.headers },
        config,
        request: {}
      });
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle responses, caching, targeted invalidation, retries, and deduplication
API.interceptors.response.use(
  (response) => {
    const config = response.config;
    const method = (config?.method || 'get').toLowerCase();

    // Cache successful GET responses received over the network
    if (method === 'get' && config && !config.__fromCache && response.status === 200) {
      const key = getCacheKey(config);
      apiCache.set(key, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      });
    }

    // Targeted mutating action (POST, PUT, DELETE, PATCH) invalidates affected areas
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      invalidateRelatedCaches(config?.url || '');
    }

    return response;
  },
  async (error) => {
    const config = error.config;

    // Automatic retry for timeouts (e.g. Render spinning up) or server 502/503
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isServerWaking = [502, 503, 504].includes(error.response?.status);
    const isNetworkError = !error.response && error.message === 'Network Error';

    if (config && (isTimeout || isServerWaking || isNetworkError)) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return API(config);
      }
    }

    if (error.response && !error.config?.url?.includes('/canva')) {
      if (error.response.status === 401) {
        clearApiCache();
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && !currentPath.startsWith('/verify')) {
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Keep-Alive auto-ping to keep free Render backend active
if (typeof window !== 'undefined') {
  const pingHealth = () => {
    const healthUrl = baseURL.endsWith('/api')
      ? `${baseURL.replace(/\/api$/, '')}/health`
      : `${baseURL}/health`;
    fetch(healthUrl).catch(() => {});
  };

  // Immediate ping on page load to pre-warm backend
  pingHealth();

  // Periodic keep-alive ping every 2 minutes while page is open
  setInterval(pingHealth, 2 * 60 * 1000);
}

export default API;

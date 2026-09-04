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

// Add auth token to requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle responses and session expiration safely
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && !error.config?.url?.includes('/canva')) {
      if (error.response.status === 401) {
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

// Compatibility helper (no-op now as responses are fetched fresh)
export const clearApiCache = () => {};

// Keep-Alive auto-ping to keep free Render backend active 24/7
if (typeof window !== 'undefined') {
  setInterval(() => {
    fetch(`${baseURL.replace('/api', '')}/health`).catch(() => {});
  }, 3 * 60 * 1000); // Ping every 3 minutes
}

export default API;

import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://ems-euvq.onrender.com/api';
const baseURL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

const API = axios.create({
  baseURL,
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

// Auto logout on 401 Unauthorized or 403 Forbidden errors (excluding Canva integration auth errors)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && !error.config?.url?.includes('/canva')) {
      if (error.response.status === 401 || error.response.status === 403) {
        // If non-admin user attempts admin operation or token expired
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

export default API;

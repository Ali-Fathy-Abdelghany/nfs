import axios from 'axios';

// Axios instance with base URL and JWT auth interceptor
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/', // Vite env variable
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('agroMagUser');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;


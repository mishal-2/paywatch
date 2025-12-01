import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (username, email, password) =>
    api.post('/api/auth/register', { username, email, password }),
  
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  
  verifyToken: () =>
    api.get('/api/auth/verify'),
};

// Transaction APIs
export const transactionAPI = {
  predict: (amount, time) =>
    api.post('/api/predict', { Amount: amount, Time: time }),
  
  verifyTransaction: (transactionId, otp) =>
    api.post('/api/verify-transaction', { transaction_id: transactionId, otp }),
  
  resendOTP: (transactionId) =>
    api.post('/api/resend-otp', { transaction_id: transactionId }),
  
  getTransactions: (page = 1, limit = 20, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    return api.get('/api/transactions', { params });
  },
  
  getTransactionDetails: (transactionId) =>
    api.get(`/api/transactions/${transactionId}`),
};

// Analytics APIs
export const analyticsAPI = {
  getStats: () =>
    api.get('/api/analytics/stats'),
  
  getTrends: (days = 7) =>
    api.get('/api/analytics/trends', { params: { days } }),
};

// Alerts APIs
export const alertsAPI = {
  getAlerts: (page = 1, limit = 20, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    return api.get('/api/alerts', { params });
  },
};

// Health check
export const healthCheck = () =>
  api.get('/api/health');

export default api;

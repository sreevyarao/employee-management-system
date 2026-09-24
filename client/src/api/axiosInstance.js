import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending and receiving HTTP-only cookies!
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response Interceptor for global error formatting
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorResponse = error.response?.data || {
      success: false,
      message: error.message || 'An unexpected error occurred. Please try again.',
      data: null
    };

    return Promise.reject(errorResponse);
  }
);

export default axiosInstance;

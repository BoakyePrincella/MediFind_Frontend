import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
});

// Inject token automatically on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('medifind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401 — token expired or invalid
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medifind_token');
      localStorage.removeItem('medifind_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
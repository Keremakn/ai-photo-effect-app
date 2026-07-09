import axios from 'axios';

export const ADMIN_TOKEN_KEY = 'adminToken';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.dispatchEvent(new Event('admin-auth-expired'));
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Istek tamamlanamadi.';
}

export default apiClient;

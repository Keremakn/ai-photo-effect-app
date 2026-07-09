import apiClient, { ADMIN_TOKEN_KEY } from './apiClient.js';

export async function loginAdmin(credentials) {
  const response = await apiClient.post('/api/auth/login', credentials);
  const authResult = response.data.data;

  localStorage.setItem(ADMIN_TOKEN_KEY, authResult.token);

  return authResult.user;
}

export async function getCurrentAdmin() {
  const response = await apiClient.get('/api/auth/me');
  return response.data.data;
}

export function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

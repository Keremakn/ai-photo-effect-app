import apiClient from './apiClient.js';

export async function getAdminUsers() {
  const response = await apiClient.get('/api/admin/users');
  return response.data.data;
}

export async function getAdminUserDetail(id) {
  const response = await apiClient.get(`/api/admin/users/${encodeURIComponent(id)}`);
  return response.data.data;
}

export async function updateAdminUserRole(id, role) {
  const response = await apiClient.put(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    role,
  });
  return response.data.data;
}

export async function getAdminGenerations(params = {}) {
  const response = await apiClient.get('/api/admin/generations', { params });
  return response.data.data;
}

export async function getAdminUserGenerations(id, params = {}) {
  const response = await apiClient.get(`/api/admin/users/${encodeURIComponent(id)}/generations`, { params });
  return response.data.data;
}

export async function getMyGenerations(params = {}) {
  const response = await apiClient.get('/api/generations/me', { params });
  return response.data.data;
}

export async function getAdminDashboardStats() {
  const response = await apiClient.get('/api/admin/dashboard');
  return response.data.data;
}

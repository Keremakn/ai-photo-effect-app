import apiClient from './apiClient.js';

export async function getAdminUsers() {
  const response = await apiClient.get('/api/admin/users');
  return response.data.data;
}

export async function updateAdminUserRole(id, role) {
  const response = await apiClient.put(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    role,
  });
  return response.data.data;
}

export async function getAdminGenerations() {
  const response = await apiClient.get('/api/admin/generations');
  return response.data.data;
}

export async function getMyGenerations() {
  const response = await apiClient.get('/api/generations/me');
  return response.data.data;
}

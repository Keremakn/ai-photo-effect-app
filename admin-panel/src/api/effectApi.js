import apiClient from './apiClient.js';

export async function getAdminEffects() {
  const response = await apiClient.get('/api/admin/effects');
  return response.data.data;
}

export async function createEffect(effect) {
  const response = await apiClient.post('/api/admin/effects', effect);
  return response.data.data;
}

export async function updateEffect(id, effect) {
  const response = await apiClient.put(`/api/admin/effects/${encodeURIComponent(id)}`, effect);
  return response.data.data;
}

export async function deleteEffect(id) {
  const response = await apiClient.delete(`/api/admin/effects/${encodeURIComponent(id)}`);
  return response.data.data;
}

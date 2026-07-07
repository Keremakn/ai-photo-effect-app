const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'İstek tamamlanamadı.');
  }

  return payload.data;
}

export function getAdminEffects() {
  return request('/api/admin/effects');
}

export function createEffect(effect) {
  return request('/api/admin/effects', {
    method: 'POST',
    body: JSON.stringify(effect),
  });
}

export function updateEffect(id, effect) {
  return request(`/api/admin/effects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(effect),
  });
}

export function deleteEffect(id) {
  return request(`/api/admin/effects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

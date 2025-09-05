import { API_BASE, getToken, clearSession } from './auth';

export async function api(path, { method='GET', headers={}, body, json=true } = {}) {
  const h = new Headers(headers);
  const token = getToken();

  if (json && body && !(body instanceof FormData)) {
    h.set('Content-Type', 'application/json');
  }
  if (token) h.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: h,
    body: body && json ? JSON.stringify(body) : body,
  });

  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    if (res.status === 401) clearSession(); // token inválido/expirado → limpia sesión
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

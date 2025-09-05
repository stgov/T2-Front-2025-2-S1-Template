export const TOKEN_KEY = 'token';
export const USER_KEY  = 'user';
export const API_BASE  = 'http://localhost:3000';

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getUser() {
  const s = localStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
}
function b64urlDecode(str) {
  try {
    const pad = (s) => s + '==='.slice((s.length + 3) % 4);
    const base64 = pad(str.replace(/-/g, '+').replace(/_/g, '/'));
    return atob(base64);
  } catch { return ''; }
}
export function parseJwt(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(b64urlDecode(payload));
  } catch { return null; }
}
export function getCurrentUserId() {
  const p = parseJwt(getToken() || '');
  return p?.id ?? null;
}

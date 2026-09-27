import { API } from '../config';

// Lectura pública con tiempo límite: si el backend no responde, la tienda sigue con sus datos de respaldo
export async function fetchConFallback(ruta, ms = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const resp = await fetch(`${API}/${ruta}`, { signal: controller.signal });
    if (!resp.ok) return null;
    const json = await resp.json();
    if (json.success && json.data) return json.data;
    if (Array.isArray(json)) return json;
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Cabeceras del panel: token de sesión (y clave de admin heredada, si existe)
export function authHeaders(json = false) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  try {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
    const adminKey = localStorage.getItem('admin_key');
    if (adminKey) headers['x-admin-key'] = adminKey;
  } catch { /* almacenamiento bloqueado */ }
  return headers;
}

// Petición JSON del panel. Lanza Error con el mensaje del servidor si success es false.
export async function apiJson(ruta, { method = 'GET', body, auth = true } = {}) {
  const resp = await fetch(`${API}/${ruta}`, {
    method,
    headers: auth ? authHeaders(body !== undefined) : (body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = await resp.json().catch(() => ({}));
  if (!data.success) {
    const err = new Error(data.message || data.error || `HTTP ${resp.status}`);
    err.status = resp.status;
    throw err;
  }
  return data;
}

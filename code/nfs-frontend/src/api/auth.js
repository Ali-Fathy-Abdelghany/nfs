import { API_BASE_URL, resolveUserRole } from './config';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  return response.json();
}

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register(user) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return handleResponse(response);
}

export async function logout() {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore network errors on logout
  }
}

export function persistAuthSession(loginResponse, extra = {}) {
  const { accessToken, refreshToken, userId, email, firstName, lastName, roles } = loginResponse;
  const userRole = resolveUserRole(roles);
  const user = { id: userId, userId, email, firstName, lastName, roles, userRole, patientId: loginResponse.patientId, ...extra };

  localStorage.setItem('token', accessToken);
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userRole', userRole);
  localStorage.setItem('user', JSON.stringify(user));

  return { user, userRole, accessToken };
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
}

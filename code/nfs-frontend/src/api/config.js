export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5148';

export function resolveUserRole(roles) {
  if (!roles?.length) return 'user';
  const normalized = roles.map((r) => String(r).toUpperCase());
  if (normalized.includes('ADMIN')) return 'admin';
  if (normalized.includes('THERAPIST')) return 'doctor';
  return 'user';
}

/** Role-aware home path for logo / "go home" navigation. */
export function getRoleHomePath(role, { isAuthenticated } = {}) {
  const hasSession =
    isAuthenticated ??
    !!(localStorage.getItem('token') || localStorage.getItem('accessToken'));

  if (!hasSession) return '/';

  const normalized = String(role || localStorage.getItem('userRole') || '').toLowerCase();
  if (normalized === 'admin') return '/admin';
  if (normalized === 'doctor' || normalized === 'therapist') return '/doctor/dashboard';
  return '/dashboard';
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5148';

export function resolveUserRole(roles) {
  if (!roles?.length) return 'user';
  const normalized = roles.map((r) => String(r).toUpperCase());
  if (normalized.includes('THERAPIST') || normalized.includes('ADMIN')) return 'doctor';
  return 'user';
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

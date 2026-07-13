/**
 * Extract a user-facing message from an Axios (or similar) error.
 * Prefer API Conflict/BadRequest `{ message }` payloads.
 */
export function getApiErrorMessage(err, fallback = 'حدث خطأ، حاول مرة أخرى') {
  const data = err?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title.trim();
    }
    // ASP.NET validation dictionary
    if (data.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors).flat().find((v) => typeof v === 'string');
      if (first) return first;
    }
  }

  if (typeof err?.message === 'string' && err.message && !err.message.startsWith('Request failed')) {
    return err.message;
  }

  return fallback;
}

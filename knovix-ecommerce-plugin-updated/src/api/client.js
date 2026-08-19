// WordPress / Knovix API configuration

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const API_PREFIX = '/wp-json/knovix/v1';
const REQUEST_TIMEOUT_MS = 12000;

function authHeader() {
  const token = localStorage.getItem('knovix_token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function fetchOnce(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed (${res.status})`);
    }

    return res.status === 204 ? null : res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiFetch(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${API_PREFIX}${cleanPath}`;
  const method = (options.method || 'GET').toUpperCase();

  try {
    return await fetchOnce(url, options);
  } catch (err) {
    // A stray network blip (or a timeout) shouldn't surface as a hard
    // error on the first try — retry once for idempotent GET requests
    // before giving up and letting the caller show its error/retry UI.
    if (method !== 'GET') throw err;

    await new Promise((resolve) => setTimeout(resolve, 600));
    return fetchOnce(url, options);
  }
}

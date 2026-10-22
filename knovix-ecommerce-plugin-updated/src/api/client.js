// WordPress / Knovix API configuration

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

const API_PREFIX = '/wp-json/knovix/v1';
const REQUEST_TIMEOUT_MS = 12000;

if (!API_BASE && typeof console !== 'undefined') {
  // Without this the app calls /wp-json/... on the *frontend's own* host,
  // which returns an HTML 404 page - the classic "backend didn't load" cause.
  console.error(
    '[knovix] VITE_API_BASE_URL is empty. Set it in .env.production to your WordPress site ' +
    '(e.g. https://cms.yourdomain.com) and rebuild.'
  );
}

export function getToken() {
  try { return localStorage.getItem('knovix_token'); } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem('knovix_token', token);
    else localStorage.removeItem('knovix_token');
  } catch { /* storage unavailable */ }
}

function authHeader() {
  const token = getToken();
  // Many shared hosts (LiteSpeed / FastCGI, e.g. Hostinger) silently strip the
  // standard Authorization header before PHP sees it, which makes every
  // logged-in request look anonymous. X-Knovix-Token is never stripped, and the
  // plugin accepts either one.
  return token
    ? { Authorization: `Bearer ${token}`, 'X-Knovix-Token': token }
    : {};
}

async function fetchOnce(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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

    const text = await res.text();
    let body = null;
    if (text) {
      try { body = JSON.parse(text); } catch { body = undefined; /* not JSON */ }
    }

    if (!res.ok) {
      const err = new Error(
        (body && body.message) || `Request failed (${res.status})`
      );
      err.status = res.status;
      throw err;
    }

    if (res.status === 204 || text === '') return null;

    if (body === undefined) {
      // 200 OK but not JSON: a redirect to an HTML page, a "site under
      // construction" page, a security-plugin block page, or the plugin is not
      // active so WordPress served its normal HTML. Say so instead of crashing.
      const err = new Error(
        'The store server returned an unexpected response. Please try again shortly.'
      );
      err.status = res.status;
      err.notJson = true;
      console.error('[knovix] Non-JSON response from', url, '->', text.slice(0, 200));
      throw err;
    }

    return body;
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('Request timed out. Please check your connection and try again.');
      e.timeout = true;
      throw e;
    }
    // The browser throws a bare TypeError ("Failed to fetch") when the request
    // never got a response at all: server down, DNS/SSL problem, a redirect on
    // a cross-origin request, or blocked by CORS.
    if (err instanceof TypeError) {
      console.error('[knovix] Network/CORS failure calling', url, err);
      const e = new Error("Can't reach the server right now. Please check your connection and try again in a moment.");
      e.network = true;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiFetch(path, options = {}) {
  const { timeout = REQUEST_TIMEOUT_MS, retry, ...fetchOptions } = options;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${API_PREFIX}${cleanPath}`;
  const method = (fetchOptions.method || 'GET').toUpperCase();

  try {
    return await fetchOnce(url, fetchOptions, timeout);
  } catch (err) {
    // Retry once for idempotent GETs, but only for transient failures
    // (network blip / timeout / 5xx) - never for 4xx or non-JSON replies,
    // which would just fail the same way and double the wait.
    const transient = err.network || err.timeout || (err.status >= 500);
    const shouldRetry = retry !== undefined ? retry : method === 'GET';
    if (!shouldRetry || !transient) throw err;

    await new Promise((resolve) => setTimeout(resolve, 600));
    return fetchOnce(url, fetchOptions, timeout);
  }
}

// WordPress / Knovix API configuration

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "";

const API_PREFIX = "/wp-json/knovix/v1";

function authHeader() {
  const token = localStorage.getItem("knovix_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || `Request failed (${res.status})`
    );
  }

  return res.status === 204 ? null : res.json();
}
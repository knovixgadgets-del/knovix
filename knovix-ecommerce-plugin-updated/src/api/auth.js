import { apiFetch, getToken, setToken } from './client'

// All authentication goes through the WordPress / Knovix API. (The old
// localStorage "mock backend" fallback was removed: it shipped demo accounts,
// including an admin login with a known password, inside the public JS bundle.)

export async function login(email, password) {
  const user = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  setToken(user.token)
  return user
}

export async function signup(payload) {
  const user = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
  setToken(user.token)
  return user
}

export function requestOtp(phone) {
  return apiFetch('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) })
}

export async function verifyOtp(phone, otp, name) {
  const user = await apiFetch('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp, name }) })
  setToken(user.token)
  return user
}

// Sets the display name of the signed-in customer (used right after a brand-new
// phone/OTP signup). The OTP is single-use, so the name can't be sent by
// verifying the same code a second time.
export function updateProfile(payload) {
  return apiFetch('/auth/profile', { method: 'POST', body: JSON.stringify(payload) })
}

export async function logout() {
  try {
    if (getToken()) await apiFetch('/auth/logout', { method: 'POST', retry: false, timeout: 6000 })
  } catch {
    // Server unreachable or token already invalid - still sign out locally.
  } finally {
    setToken(null)
  }
}

export async function getSession() {
  // Guests have no token: nothing to restore, so don't make a network call.
  if (!getToken()) return null
  try {
    return (await apiFetch('/auth/session', { timeout: 8000, retry: false })) || null
  } catch (err) {
    // Token rejected / expired -> drop it. A network failure keeps it so the
    // customer stays signed in once the connection is back.
    if (err.status === 401 || err.status === 403) setToken(null)
    return null
  }
}

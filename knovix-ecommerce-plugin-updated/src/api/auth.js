import { localDb } from '../data/localStore'
import { apiFetch, getToken, setToken } from './client'

const USE_WORDPRESS = true

export async function login(email, password) {
  if (USE_WORDPRESS) {
    const user = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(user.token)
    return user
  }
  return localDb.login(email, password)
}

export async function signup(payload) {
  if (USE_WORDPRESS) {
    const user = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
    setToken(user.token)
    return user
  }
  return localDb.signup(payload)
}

export async function requestOtp(phone) {
  if (USE_WORDPRESS) {
    return apiFetch('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) })
  }
  // Local/demo fallback — no SMS provider wired up outside WordPress mode.
  return { success: true, otpLength: 4, expiresIn: 300, resendIn: 45 }
}

export async function verifyOtp(phone, otp, name) {
  if (USE_WORDPRESS) {
    const user = await apiFetch('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp, name }) })
    setToken(user.token)
    return user
  }
  return localDb.login('demo@knovix.com', 'demo1234')
}

// Sets the display name of the signed-in customer (used right after a brand-new
// phone/OTP signup). The OTP is single-use, so the name can't be sent by
// verifying the same code a second time.
export async function updateProfile(payload) {
  if (USE_WORDPRESS) {
    return apiFetch('/auth/profile', { method: 'POST', body: JSON.stringify(payload) })
  }
  return localDb.getSession()
}

export async function logout() {
  if (USE_WORDPRESS) {
    try {
      if (getToken()) await apiFetch('/auth/logout', { method: 'POST', retry: false, timeout: 6000 })
    } catch {
      // Server unreachable or token already invalid - still sign out locally.
    } finally {
      setToken(null)
    }
    return
  }
  return localDb.logout()
}

export async function getSession() {
  if (USE_WORDPRESS) {
    // Guests have no token: there is nothing to restore, so don't make a network
    // call at all. (This call used to run for every visitor and, when the
    // backend was slow/unreachable, kept /checkout, /account and /admin blank
    // for 25+ seconds.)
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
  return localDb.getSession()
}

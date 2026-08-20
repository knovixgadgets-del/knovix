import { localDb } from '../data/localStore'
import { apiFetch } from './client'

const USE_WORDPRESS = true

export async function login(email, password) {
  if (USE_WORDPRESS) {
    const user = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('knovix_token', user.token)
    return user
  }
  return localDb.login(email, password)
}

export async function signup(payload) {
  if (USE_WORDPRESS) {
    const user = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
    localStorage.setItem('knovix_token', user.token)
    return user
  }
  return localDb.signup(payload)
}

export async function requestOtp(phone) {
  if (USE_WORDPRESS) {
    return apiFetch('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) })
  }
  // Local/demo fallback — no SMS provider wired up outside WordPress mode.
  return { success: true, expiresIn: 300, resendIn: 45 }
}

export async function verifyOtp(phone, otp, name) {
  if (USE_WORDPRESS) {
    const user = await apiFetch('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp, name }) })
    localStorage.setItem('knovix_token', user.token)
    return user
  }
  return localDb.login('demo@knovix.com', 'demo1234')
}

export async function logout() {
  if (USE_WORDPRESS) {
    await apiFetch('/auth/logout', { method: 'POST' })
    localStorage.removeItem('knovix_token')
    return
  }
  return localDb.logout()
}

export function getSession() {
  if (USE_WORDPRESS) return apiFetch('/auth/session').catch(() => null)
  return localDb.getSession()
}

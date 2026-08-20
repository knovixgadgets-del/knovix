import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.getSession().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  async function login(email, password) {
    const u = await authApi.login(email, password)
    setUser(u)
    return u
  }
  async function signup(payload) {
    const u = await authApi.signup(payload)
    setUser(u)
    return u
  }
  async function requestOtp(phone) {
    return authApi.requestOtp(phone)
  }
  async function verifyOtp(phone, otp, name) {
    const u = await authApi.verifyOtp(phone, otp, name)
    setUser(u)
    return u
  }
  async function logout() {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, requestOtp, verifyOtp, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

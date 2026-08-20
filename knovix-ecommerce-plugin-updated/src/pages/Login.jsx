import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function useResendTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0)
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])
  return [secondsLeft, setSecondsLeft]
}

// Phone + OTP is the primary flow (matches how most Indian shoppers expect
// to sign in) — entering an OTP for a number we haven't seen before creates
// the account automatically, so this one screen covers both login and
// signup. A collapsible email/password form underneath still exists,
// mainly so the admin/demo account can get into /admin.
export default function Login() {
  const { requestOtp, verifyOtp, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [askName, setAskName] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useResendTimer()
  const otpInputRef = useRef(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [pwEmail, setPwEmail] = useState('demo@knovix.com')
  const [pwPassword, setPwPassword] = useState('demo1234')

  function goToDestination(user) {
    const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/')
    navigate(dest, { replace: true })
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      const res = await requestOtp(digits)
      setStep('otp')
      setSecondsLeft(res.resendIn || 45)
      setTimeout(() => otpInputRef.current?.focus(), 50)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setLoading(true)
    try {
      const res = await requestOtp(phone.replace(/\D/g, ''))
      setSecondsLeft(res.resendIn || 45)
      setOtp('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    if (otp.replace(/\D/g, '').length !== 6) {
      setError('Enter the 6-digit code sent to your phone.')
      return
    }
    setLoading(true)
    try {
      const user = await verifyOtp(phone.replace(/\D/g, ''), otp, name)
      if (user.isNewUser && !name) {
        // First-time user, no name captured yet — ask once, quickly,
        // rather than blocking the OTP step on it.
        setAskName(true)
        setLoading(false)
        return
      }
      goToDestination(user)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(pwEmail, pwPassword)
      goToDestination(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-px max-w-sm mx-auto py-16">
      <h1 className="text-xl font-bold text-center">Welcome to Knovix</h1>
      <p className="text-sm text-slate-500 text-center mt-1">
        {step === 'phone' ? 'Login or sign up with your mobile number' : `Enter the code sent to +91 ${phone}`}
      </p>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2 mt-4">{error}</p>}

      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
          <div>
            <label className="label">Mobile Number</label>
            <div className="flex items-stretch h-11 rounded-md border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-brand-400">
              <span className="flex items-center px-3 bg-slate-50 text-sm text-slate-600 border-r border-slate-300">+91</span>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                className="flex-1 min-w-0 px-3 text-sm focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && !askName && (
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="label">6-Digit OTP</label>
            <input
              ref={otpInputRef}
              required
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              className="input tracking-[0.4em] text-center text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>
          <div className="flex items-center justify-between text-xs">
            <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError('') }} className="text-slate-500 hover:text-ink-900">
              ← Change number
            </button>
            {secondsLeft > 0 ? (
              <span className="text-slate-400">Resend in {secondsLeft}s</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-brand-700 font-medium" disabled={loading}>
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {askName && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError('')
            try {
              const user = await verifyOtp(phone.replace(/\D/g, ''), otp, name)
              goToDestination(user)
            } catch (err) {
              setError(err.message)
            } finally {
              setLoading(false)
            }
          }}
          className="mt-6 space-y-4"
        >
          <p className="text-sm text-slate-500 text-center">You're verified! What should we call you?</p>
          <div>
            <label className="label">Full Name</label>
            <input required autoFocus className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Finishing up…' : 'Continue'}
          </button>
        </form>
      )}

      {/* Fallback for admin / anyone with an existing email+password account */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowPasswordForm((v) => !v)}
          className="text-xs text-slate-400 hover:text-slate-600 w-full text-center"
        >
          {showPasswordForm ? 'Hide' : 'Admin or existing account? Login with email & password'}
        </button>

        {showPasswordForm && (
          <form onSubmit={handlePasswordLogin} className="mt-4 space-y-3">
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" value={pwEmail} onChange={(e) => setPwEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input required type="password" className="input" value={pwPassword} onChange={(e) => setPwPassword(e.target.value)} />
            </div>
            <button disabled={loading} className="btn-outline w-full">
              {loading ? 'Logging in…' : 'Login'}
            </button>
            <p className="text-xs text-slate-400 text-center">
              Demo accounts — Customer: demo@knovix.com / demo1234 · Admin: admin@knovix.com / admin123
            </p>
          </form>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        By continuing you agree to Knovix's <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  )
}

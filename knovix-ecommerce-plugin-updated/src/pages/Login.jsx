import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('demo@knovix.com')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/')
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-px max-w-sm mx-auto py-16">
      <h1 className="text-xl font-bold text-center">Welcome back</h1>
      <p className="text-sm text-slate-500 text-center mt-1">Login to your Knovix account</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Logging in…' : 'Login'}</button>
      </form>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Demo accounts — Customer: demo@knovix.com / demo1234 · Admin: admin@knovix.com / admin123
      </p>
      <p className="text-sm text-center mt-4">
        Don't have an account? <Link to="/signup" className="text-brand-700 font-medium">Sign up</Link>
      </p>
    </div>
  )
}

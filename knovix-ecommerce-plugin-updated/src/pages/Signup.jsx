import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-px max-w-sm mx-auto py-16">
      <h1 className="text-xl font-bold text-center">Create your account</h1>
      <p className="text-sm text-slate-500 text-center mt-1">Join Knovix Gadgets today</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2">{error}</p>}
        <div>
          <label className="label">Full Name</label>
          <input required className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input required type="password" minLength={6} className="input" value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Sign Up'}</button>
      </form>

      <p className="text-sm text-center mt-4">
        Already have an account? <Link to="/login" className="text-brand-700 font-medium">Login</Link>
      </p>
    </div>
  )
}

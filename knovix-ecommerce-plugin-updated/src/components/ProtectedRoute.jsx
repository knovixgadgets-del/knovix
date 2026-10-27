import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SessionLoading() {
  return (
    <div className="container-px max-w-3xl mx-auto py-24 text-center text-sm text-slate-500" role="status" aria-live="polite">
      Checking your sign-in…
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <SessionLoading />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()
  if (loading) return <SessionLoading />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/products', label: '📦 Products' },
  { to: '/admin/orders', label: '🧾 Orders' }
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen grid md:grid-cols-[220px_1fr] bg-slate-50">
      <aside className="bg-ink-900 text-white p-5 flex flex-col">
        <Link to="/" className="text-lg font-extrabold font-display mb-8">KNOVIX <span className="text-brand-400 text-xs font-normal block">Admin Panel</span></Link>
        <nav className="space-y-1 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="text-xs text-slate-400 border-t border-white/10 pt-4">
          <p className="text-white">{user?.name}</p>
          <button onClick={logout} className="mt-2 text-red-400">Logout</button>
        </div>
      </aside>
      <main className="p-6 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}

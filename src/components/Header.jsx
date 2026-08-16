import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
<<<<<<< HEAD
=======
  { to: '/shop?sort=price_asc', label: 'Deals' },
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/brands', label: 'Brands' },
  { to: '/blog', label: 'Blog' },
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  { to: '/shop?sort=rating', label: 'Best Rated' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/contact', label: 'Contact' }
]

<<<<<<< HEAD
const promoMessages = [
  '🚚 Free Shipping on all orders above ₹499',
  '🔄 7-Day Easy Replacement',
  '🎧 24/7 Customer Support',
  '⚡ Mega Deals Live Now — Shop Today!'
]

const topLinks = [
  { to: '/shop?sort=price_asc', label: 'Deals' },
  { to: '/shop', label: 'New Arrivals' },
  { to: '/shop', label: 'Brands' }
=======
// Shown as a compact horizontally-scrollable strip on mobile, right under the
// logo row (replaces the cart icon that used to sit top-right on mobile —
// cart is still reachable from the bottom tab bar there).
const quickLinks = [
  { to: '/shop?sort=price_asc', label: 'Deals' },
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/brands', label: 'Brands' },
  { to: '/blog', label: 'Blog' }
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
]

export default function Header({ menuOpen, setMenuOpen }) {
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const { user, logout, isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function onSearch(e) {
    e.preventDefault()
    navigate(`/shop${query ? `?search=${encodeURIComponent(query)}` : ''}`)
<<<<<<< HEAD
    setMenuOpen(false)
=======
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
<<<<<<< HEAD
      <div className="bg-ink-900 text-white text-xs overflow-hidden">
        <div className="container-px max-w-7xl mx-auto flex items-center gap-3 sm:gap-6 py-1.5">
          <div className="flex-1 min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]">
            <div className="marquee-track flex items-center gap-10 whitespace-nowrap w-max">
              {[...promoMessages, ...promoMessages].map((msg, i) => (
                <span key={i}>{msg}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-medium">
            {topLinks.map((l) => (
              <Link key={l.label} to={l.to} className="hover:text-brand-300 whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </div>
=======
      <div className="bg-ink-900 text-white text-xs">
        <div className="container-px max-w-7xl mx-auto flex items-center justify-between py-1.5">
          <span>Free Shipping on all orders above ₹499</span>
          <span className="hidden sm:inline">7-Day Easy Replacement</span>
          <span className="hidden md:inline">24/7 Customer Support</span>
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
        </div>
      </div>

      <div className="container-px max-w-7xl mx-auto flex items-center gap-4 py-3">
        <Link to="/" className="flex flex-col leading-none shrink-0">
          <span className="text-2xl font-extrabold font-display tracking-tight">
            <span className="text-brand-600">KNOVIX</span>
          </span>
          <span className="text-[10px] tracking-[0.3em] text-slate-500">GADGETS</span>
        </Link>

<<<<<<< HEAD
        <form onSubmit={onSearch} className="hidden lg:flex flex-1 max-w-xl">
=======
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for gadgets, accessories..."
            className="input rounded-r-none"
          />
          <button className="btn-primary rounded-l-none px-4">🔍</button>
        </form>

        <div className="flex items-center gap-5 ml-auto text-sm">
<<<<<<< HEAD
          <Link to="/wishlist" className="hidden lg:flex flex-col items-center text-slate-600 hover:text-brand-700">
=======
          <Link to="/wishlist" className="hidden sm:flex flex-col items-center text-slate-600 hover:text-brand-700">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
            <span>♡ {wishCount > 0 && <sup>{wishCount}</sup>}</span>
            <span className="text-xs">Wishlist</span>
          </Link>

<<<<<<< HEAD
          <div className="relative group hidden lg:block">
=======
          <div className="relative group hidden sm:block">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
            <button className="flex flex-col items-center text-slate-600 hover:text-brand-700">
              <span>👤</span>
              <span className="text-xs">{user ? user.name.split(' ')[0] : 'Account'}</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-white card p-2 hidden group-hover:block">
              {user ? (
                <>
                  <Link to="/account" className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm">My Orders</Link>
                  {isAdmin && <Link to="/admin" className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm">Admin Panel</Link>}
                  <button onClick={logout} className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 text-sm text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm">Login</Link>
                  <Link to="/signup" className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm">Sign Up</Link>
                </>
              )}
            </div>
          </div>

<<<<<<< HEAD
          <Link to="/cart" className="hidden lg:flex relative flex-col items-center text-slate-600 hover:text-brand-700">
=======
          <Link to="/cart" className="relative hidden sm:flex flex-col items-center text-slate-600 hover:text-brand-700">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
            <span>🛒</span>
            <span className="text-xs">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

<<<<<<< HEAD
      <nav className="hidden lg:block border-t border-slate-100">
        <div className="container-px max-w-7xl mx-auto flex items-center gap-6 py-2 text-sm font-medium">
=======
      <nav className="md:hidden border-t border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-5 px-4 py-2 text-xs font-medium whitespace-nowrap">
          {quickLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) => (isActive ? 'text-brand-700' : 'text-slate-700 hover:text-brand-700')}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <nav className="hidden md:block border-t border-slate-100">
        <div className="container-px max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-1.5 py-2 text-sm font-medium">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) => (isActive ? 'text-brand-700' : 'text-slate-700 hover:text-brand-700')}
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {menuOpen && (
<<<<<<< HEAD
        <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-2">
=======
        <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-2">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
          <form onSubmit={onSearch} className="flex mb-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="input rounded-r-none" />
            <button className="btn-primary rounded-l-none px-4">🔍</button>
          </form>
          {navLinks.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)} className="block py-1 text-sm">{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)} className="block py-1 text-sm">My Orders</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-1 text-sm">Admin Panel</Link>}
<<<<<<< HEAD
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block py-1 text-sm text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-1 text-sm">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="block py-1 text-sm">Sign Up</Link>
            </>
=======
              <button onClick={logout} className="block py-1 text-sm text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-1 text-sm">Login</Link>
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
          )}
        </div>
      )}
    </header>
  )
}

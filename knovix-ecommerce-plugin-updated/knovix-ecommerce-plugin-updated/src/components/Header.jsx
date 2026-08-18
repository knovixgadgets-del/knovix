import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { getCategories } from '../api/products'
import {
  CameraIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
  CategoryIcon
} from './Icons'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?sort=price_asc', label: 'Deals' },
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/brands', label: 'Brands' },
  { to: '/blog', label: 'Blog' },
  { to: '/shop?sort=rating', label: 'Best Rated' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/contact', label: 'Contact' }
]

// Mobile menu drops Deals / New Arrivals / Brands — they live in the single
// quick-nav strip under the mobile search bar instead (see quickLinks
// below), so they don't appear a second time inside the hamburger menu.
const mobileHiddenLabels = ['Deals', 'New Arrivals', 'Brands']
const mobileNavLinks = navLinks.filter((l) => !mobileHiddenLabels.includes(l.label))

const promoMessages = [
  '🚚 Free Shipping on all orders above ₹499',
  '🔄 7-Day Easy Replacement',
  '🎧 24/7 Customer Support',
  '⚡ Mega Deals Live Now — Shop Today!'
]

// Single source of truth for the Deals / New Arrivals / Brands quick links.
// Previously this same list was duplicated three times (promo bar, a
// mobile action-row, and the homepage hero) — it now renders in exactly
// one place per breakpoint: the desktop nav row, and a chip strip under
// the mobile search bar.
const quickLinks = [
  { to: '/shop?sort=price_asc', label: 'Deals', icon: '🔥' },
  { to: '/shop?sort=newest', label: 'New Arrivals', icon: '✨' },
  { to: '/brands', label: 'Brands', icon: '🏷️' }
]

export default function Header({ menuOpen, setMenuOpen }) {
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const { user, logout, isAdmin } = useAuth()

  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [catOpen, setCatOpen] = useState(false)
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const catRef = useRef(null)

  useEffect(() => {
    getCategories()
      .then((items) => setCategories(Array.isArray(items) ? items.slice(0, 8) : []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function onSearch(e) {
    e.preventDefault()

    navigate(
      `/shop${query ? `?search=${encodeURIComponent(query)}` : ''}`
    )

    setMenuOpen(false)
  }

  // Visual/camera search: WordPress's product API doesn't do image
  // recognition, so this opens the device camera/photo picker and takes
  // the shopper to the catalog with a note, rather than faking a match.
  function onScanImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    navigate('/shop?visualSearch=1')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">

      {/* Promo bar — scrolling messages only; Deals/New Arrivals/Brands
          live in one place per breakpoint (see quickLinks) so they don't
          repeat here too. */}
      <div className="bg-ink-900 text-white text-xs overflow-hidden">
        <div className="container-px max-w-7xl mx-auto flex items-center py-1.5">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="marquee-track flex items-center gap-10 whitespace-nowrap w-max">
              {[...promoMessages, ...promoMessages].map((msg, i) => (
                <span key={i}>{msg}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-px max-w-7xl mx-auto flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3">

        {/* Logo — small, fixed-height mark so it never crowds the row */}
        <Link
          to="/"
          className="flex items-center shrink-0"
          aria-label="Knovix — home"
        >
          <img
            src="/brand/knovix-logo-trimmed.png"
            alt="Knovix"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop search */}
        <form
          onSubmit={onSearch}
          className="hidden lg:flex flex-1 max-w-xl"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for gadgets, accessories..."
            className="input rounded-r-none h-10"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            aria-label="Search by photo"
            title="Search by photo"
            className="flex items-center justify-center border-y border-slate-300 px-3 text-slate-500 hover:text-brand-700 h-10"
          >
            <CameraIcon className="w-5 h-5" />
          </button>

          <button
            type="submit"
            aria-label="Search"
            className="btn-primary rounded-l-none px-4 h-10"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </form>

        {/* Shared hidden input for the camera-scan button (desktop + mobile) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onScanImage}
          className="hidden"
        />

        {/* Header actions */}
        <div className="flex items-center gap-4 sm:gap-5 ml-auto text-sm">

          {/* Categories — sits opposite the logo, balancing the row on
              mobile the way most storefronts pair a small logo mark with
              an "All Categories" entry point on the other edge. */}
          <div className="relative" ref={catRef}>
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              aria-expanded={catOpen}
              aria-label="Browse categories"
              className="flex flex-col items-center text-slate-600 hover:text-brand-700"
            >
              <CategoryIcon className="w-5 h-5" />
              <span className="hidden sm:block text-xs mt-0.5">Categories</span>
            </button>

            {catOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white card p-2 z-50">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Shop by Category
                </p>

                {categories.length === 0 && (
                  <p className="px-2 py-1.5 text-sm text-slate-500">Loading…</p>
                )}

                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?category=${c.id}`}
                    onClick={() => setCatOpen(false)}
                    className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm truncate"
                  >
                    {c.name}
                  </Link>
                ))}

                <Link
                  to="/shop"
                  onClick={() => setCatOpen(false)}
                  className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm font-medium text-brand-700 border-t border-slate-100 mt-1 pt-2"
                >
                  View All Categories →
                </Link>
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="hidden lg:flex flex-col items-center text-slate-600 hover:text-brand-700"
          >
            <span className="relative">
              <HeartIcon className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </span>

            <span className="text-xs mt-0.5">
              Wishlist
            </span>
          </Link>

          {/* Account */}
          <div className="relative group hidden lg:block">

            <button
              type="button"
              className="flex flex-col items-center text-slate-600 hover:text-brand-700"
            >
              <AccountIcon className="w-5 h-5" />

              <span className="text-xs mt-0.5">
                {user
                  ? user.name?.split(' ')[0] || 'Account'
                  : 'Account'}
              </span>
            </button>

            <div className="absolute right-0 mt-1 w-44 bg-white card p-2 hidden group-hover:block">

              {user ? (
                <>
                  <Link
                    to="/account"
                    className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm"
                  >
                    My Orders
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 text-sm text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}

            </div>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="hidden lg:flex relative flex-col items-center text-slate-600 hover:text-brand-700"
          >
            <CartIcon className="w-5 h-5" />

            <span className="text-xs mt-0.5">
              Cart
            </span>

            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* Mobile search — standard mobile sizing, lens (search) + camera
          icons styled like Amazon's search bar */}
      <div className="lg:hidden container-px max-w-7xl mx-auto pb-2.5">
        <form onSubmit={onSearch} className="flex h-10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for gadgets, accessories..."
            className="input rounded-r-none flex-1 h-10 text-sm"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            aria-label="Search by photo"
            title="Search by photo"
            className="flex items-center justify-center border-y border-slate-300 px-2.5 text-slate-500 hover:text-brand-700 h-10 w-10 shrink-0"
          >
            <CameraIcon className="w-5 h-5" />
          </button>

          <button
            type="submit"
            aria-label="Search"
            className="btn-primary rounded-l-none px-3.5 h-10 w-11 shrink-0"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </form>

        {/* Quick category chips — placed under the search bar (not in the
            hero section) so they read as part of header navigation */}
        <nav className="flex flex-wrap items-center gap-2 mt-2.5">
          {quickLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden lg:block border-t border-slate-100">
        <div className="container-px max-w-7xl mx-auto flex items-center gap-6 py-2 text-sm font-medium">

          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                isActive
                  ? 'text-brand-700'
                  : 'text-slate-700 hover:text-brand-700'
              }
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}

        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-3">

          {/* Mobile navigation */}
          <nav className="flex flex-col space-y-1">

            {mobileNavLinks.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
                end={l.to === '/'}
              >
                {l.label}
              </NavLink>
            ))}

          </nav>

          {/* Mobile account */}
          <div className="border-t border-slate-100 pt-3">

            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50"
                >
                  <AccountIcon className="w-4 h-4" /> My Account
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded hover:bg-slate-50"
                  >
                    ⚙️ Admin Panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 text-red-600"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-slate-50"
                >
                  🔐 Login
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-slate-50"
                >
                  ✨ Sign Up
                </Link>
              </>
            )}

          </div>

          {/* Mobile cart */}
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <CartIcon className="w-4 h-4" /> Cart
            </span>

            {count > 0 && (
              <span className="bg-brand-600 text-white text-xs rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </Link>

        </div>
      )}

    </header>
  )
}

import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { getCategories } from '../api/products'
import { navLinks, quickLinks } from '../data/navLinks'
import {
  CameraIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
  CategoryIcon,
  ChevronDownIcon
} from './Icons'

const promoMessages = [
  '🚚 Free Shipping on all orders above ₹499',
  '🔄 7-Day Easy Replacement',
  '🎧 24/7 Customer Support',
  '⚡ Mega Deals Live Now — Shop Today!'
]

export default function Header({ menuOpen, setMenuOpen }) {
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const { user, logout, isAdmin } = useAuth()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoriesError, setCategoriesError] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const catRef = useRef(null)

  function loadCategories() {
    setCategoriesError(false)
    getCategories()
      .then((items) => setCategories(Array.isArray(items) ? items.slice(0, 12) : []))
      .catch(() => setCategoriesError(true))
  }

  useEffect(() => {
    loadCategories()
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

    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (category) params.set('category', category.id)

    navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`)
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

        {/* Search — a single continuous bar: category segment (one divider)
            on the left, then the input, then the lens button on the right
            after the text — the same layout at every breakpoint, the way
            Amazon's search bar is built. */}
        <form
          onSubmit={onSearch}
          className="flex items-stretch flex-1 min-w-0 sm:max-w-xl h-10 rounded-md border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-brand-400"
        >
          <div className="relative shrink-0" ref={catRef}>
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              aria-expanded={catOpen}
              aria-label="Browse categories"
              className="flex items-center gap-1 h-full px-2.5 sm:px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium border-r border-slate-300 max-w-[64px] sm:max-w-[130px]"
            >
              <CategoryIcon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline truncate">
                {category ? category.name : 'All'}
              </span>
              <ChevronDownIcon className="hidden sm:inline w-3.5 h-3.5 shrink-0 text-slate-400" />
            </button>

            {catOpen && (
              <div className="absolute left-0 mt-1 w-60 bg-white card p-1.5 z-50">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Shop by Category
                </p>

                <button
                  type="button"
                  onClick={() => { setCategory(null); setCatOpen(false) }}
                  className={`w-full text-left px-2.5 py-2 rounded text-sm ${
                    !category ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>

                {categoriesError && (
                  <div className="px-2.5 py-2 text-sm text-slate-500 flex items-center justify-between gap-2">
                    <span>Couldn't load categories.</span>
                    <button type="button" onClick={loadCategories} className="text-brand-700 font-medium shrink-0">
                      Retry
                    </button>
                  </div>
                )}

                {!categoriesError && categories.length === 0 && (
                  <div className="px-2.5 py-1.5 space-y-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-6 rounded bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                )}

                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => { setCategory(c); setCatOpen(false) }}
                    className={`block w-full text-left px-2.5 py-2 rounded text-sm truncate ${
                      category?.id === c.id ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gadgets, accessories..."
            className="flex-1 min-w-0 h-full px-3 text-sm focus:outline-none"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            aria-label="Search by photo"
            title="Search by photo"
            className="flex items-center justify-center w-9 shrink-0 text-slate-500 hover:text-brand-700"
          >
            <CameraIcon className="w-[18px] h-[18px]" />
          </button>

          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center w-11 shrink-0 bg-brand-600 hover:bg-brand-700 text-white"
          >
            <SearchIcon className="w-[18px] h-[18px]" />
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

        {/* Header actions (desktop only — mobile uses the bottom nav +
            menu sheet for these) */}
        <div className="hidden lg:flex items-center gap-5 ml-auto text-sm shrink-0">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="flex flex-col items-center text-slate-600 hover:text-brand-700"
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
          <div className="relative group">

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
            className="relative flex flex-col items-center text-slate-600 hover:text-brand-700"
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

      {/* Quick category chips (mobile only) — sit directly under the
          header row that now holds the search bar, instead of under a
          second separate search row */}
      <div className="lg:hidden container-px max-w-7xl mx-auto pb-2.5">
        <nav className="flex flex-wrap items-center gap-2">
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

    </header>
  )
}

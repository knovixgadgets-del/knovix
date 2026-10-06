import { useShippingRules } from '../utils/shipping'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { getCategories } from '../api/products'
import { navLinks } from '../data/navLinks'
import {
  CameraIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
  CategoryIcon,
  ChevronDownIcon,
  MenuIcon,
  ChevronRightIcon
} from './Icons'

const promoTail = [
  '🔄 7-Day Easy Replacement',
  '💬 24/7 Customer Support',
  '⚡ Mega Deals Live Now — Shop Today!'
]

export default function Header({ menuOpen, setMenuOpen }) {
  const location = useLocation()
  const [allOpen, setAllOpen] = useState(false)
  const allRef = useRef(null)
  const { freeMin } = useShippingRules()
  const promoMessages = freeMin ? [`🚚 Free Shipping on all orders above ₹${freeMin}`, ...promoTail] : promoTail
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

  // Close the "All" menu whenever the page changes
  useEffect(() => { setAllOpen(false) }, [location.pathname, location.search])

  useEffect(() => {
    function onClickOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false)
      if (allRef.current && !allRef.current.contains(e.target)) setAllOpen(false)
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

  // Visual/camera search: WordPress's product API doesn't do object
  // recognition, so rather than faking a match this captures the photo and
  // hands it to Shop, which ranks the real catalog by actual pixel-color
  // similarity to the photo (see src/utils/visualSearch.js) — a genuine,
  // if simple, on-device comparison instead of a placeholder.
  function onScanImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      navigate('/shop?visualSearch=1', { state: { visualSearchPhoto: reader.result } })
      setMenuOpen(false)
    }
    reader.readAsDataURL(file)
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
            src="/brand/knovix-logo-header.png"
            alt="Knovix"
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </Link>

        {/* Search — a single continuous bar: category segment (one divider)
            on the left, then the input, then the lens button on the right
            after the text — the same layout at every breakpoint, the way
            Amazon's search bar is built. */}
        {/* The dropdown panel below needs to sit OUTSIDE the bar's
            overflow-hidden (which only exists to clip/round the input,
            camera and lens buttons) — otherwise it gets clipped invisible
            and the category icon looks like it does nothing, especially
            on mobile/tablet. So overflow-hidden lives on the inner bar,
            and the panel is a sibling positioned against this outer,
            non-clipping wrapper. */}
        <form
          onSubmit={onSearch}
          className="relative flex-1 min-w-0 lg:max-w-3xl"
        >
          <div className="flex items-stretch h-11 rounded-lg border-2 border-brand-600 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-300 shadow-card">
            <div className="shrink-0" ref={catRef}>
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
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mobile charger"
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
              className="flex items-center justify-center w-12 shrink-0 bg-brand-600 hover:bg-brand-700 text-white"
            >
              <SearchIcon className="w-[18px] h-[18px]" />
            </button>
          </div>

          {catOpen && (
            <div className="absolute left-0 top-full mt-1 w-64 max-w-[calc(100vw-2rem)] bg-white card p-1.5 z-50">
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

              {/* Explicit "view all categories" entry point — the request
                  behind the category icon shouldn't just filter search,
                  it should also let you browse the full category list. */}
              <Link
                to="/shop"
                onClick={() => { setCategory(null); setCatOpen(false) }}
                className="block px-2.5 py-2 rounded text-sm font-medium text-brand-700 border-t border-slate-100 mt-1 pt-2.5 hover:bg-brand-50"
              >
                View All Categories →
              </Link>
            </div>
          )}
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
            menu sheet for these). Amazon-style two-line blocks. */}
        <div className="hidden lg:flex items-center gap-1 ml-auto text-sm shrink-0">

          {/* Account & lists */}
          <div className="relative group">
            <button
              type="button"
              className="flex flex-col items-start leading-tight px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-left"
            >
              <span className="text-[11px] text-slate-500">
                Hello, {user ? user.name?.split(' ')[0] || 'there' : 'sign in'}
              </span>
              <span className="text-sm font-semibold text-ink-900 flex items-center gap-1">
                Account <ChevronDownIcon className="w-3 h-3 text-slate-400" />
              </span>
            </button>

            <div className="absolute right-0 top-full pt-1 w-48 hidden group-hover:block z-50">
              <div className="bg-white card p-2">
                {user ? (
                  <>
                    <Link to="/account" className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm">My Orders</Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm">Admin Panel</Link>
                    )}
                    <button type="button" onClick={logout} className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 text-sm text-red-600">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-2 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold text-center">Sign in</Link>
                    <Link to="/signup" className="block px-2 py-1.5 mt-1 rounded hover:bg-slate-50 text-sm text-center">New customer? Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Returns & orders */}
          <Link
            to={user ? '/account' : '/login'}
            className="flex flex-col items-start leading-tight px-2.5 py-1.5 rounded-md hover:bg-slate-100"
          >
            <span className="text-[11px] text-slate-500">Returns</span>
            <span className="text-sm font-semibold text-ink-900">& Orders</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative flex flex-col items-center px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-ink-900"
            aria-label="Wishlist"
          >
            <span className="relative">
              <HeartIcon className="w-6 h-6" />
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </span>
            <span className="text-[11px] font-semibold">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-end gap-1 px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-ink-900"
            aria-label="Cart"
          >
            <span className="relative">
              <CartIcon className="w-7 h-7" />
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-brand-700 text-sm font-bold leading-none">
                {count}
              </span>
            </span>
            <span className="text-sm font-semibold pb-0.5">Cart</span>
          </Link>

        </div>
      </div>

      {/* Amazon-style secondary strip: "All" categories menu + links.
          Horizontally scrollable on mobile, full row on desktop. */}
      <div className="hidden lg:block bg-ink-800 text-white">
        <div className="container-px max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-[13px] sm:text-sm">

          <div className="relative shrink-0" ref={allRef}>
            <button
              type="button"
              onClick={() => setAllOpen((v) => !v)}
              aria-expanded={allOpen}
              className="flex items-center gap-1.5 font-semibold px-2.5 py-2 my-1 rounded border border-transparent hover:border-white/70"
            >
              <MenuIcon className="w-4 h-4" />
              All
            </button>

            {allOpen && (
              <div className="absolute left-0 top-full mt-0 w-64 max-w-[calc(100vw-1.5rem)] bg-white text-ink-900 card p-1.5 z-50 max-h-[70vh] overflow-auto">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Shop by Category</p>
                {categoriesError && (
                  <div className="px-2.5 py-2 text-sm text-slate-500 flex items-center justify-between gap-2">
                    <span>Couldn't load categories.</span>
                    <button type="button" onClick={loadCategories} className="text-brand-700 font-medium shrink-0">Retry</button>
                  </div>
                )}
                {!categoriesError && categories.length === 0 && (
                  <div className="px-2.5 py-1.5 space-y-1.5">
                    {[0, 1, 2].map((i) => <div key={i} className="h-6 rounded bg-slate-100 animate-pulse" />)}
                  </div>
                )}
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?category=${c.id}`}
                    className="flex items-center justify-between px-2.5 py-2 rounded text-sm hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span className="truncate">{c.name}</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  </Link>
                ))}
                <Link
                  to="/shop"
                  className="block px-2.5 py-2 rounded text-sm font-semibold text-brand-700 border-t border-slate-100 mt-1 pt-2.5 hover:bg-brand-50"
                >
                  View All Products →
                </Link>
              </div>
            )}
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar min-w-0">
            {navLinks.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `shrink-0 px-2.5 py-2 my-1 rounded border whitespace-nowrap ${
                    isActive && !l.to.includes('?')
                      ? 'border-transparent font-semibold bg-white/10 shadow-[inset_0_-2px_0_#52aec7]'
                      : 'border-transparent hover:border-white/70'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {freeMin ? (
            <p className="hidden xl:block ml-auto shrink-0 text-xs text-brand-200 font-medium pl-4">
              🚚 Free delivery above ₹{freeMin}
            </p>
          ) : null}
        </div>
      </div>

    </header>
  )
}

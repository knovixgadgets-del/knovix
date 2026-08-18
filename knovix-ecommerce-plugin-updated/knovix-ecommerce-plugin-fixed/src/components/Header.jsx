import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import {
  IconHeart,
  IconUser,
  IconCart,
  IconSearch,
  IconCamera,
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

const promoMessages = [
  '🚚 Free Shipping on all orders above ₹499',
  '🔄 7-Day Easy Replacement',
  '🎧 24/7 Customer Support',
  '⚡ Mega Deals Live Now — Shop Today!'
]

const topLinks = [
  { to: '/shop?sort=price_asc', label: 'Deals' },
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/brands', label: 'Brands' }
]

export default function Header({ menuOpen, setMenuOpen }) {
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const { user, logout, isAdmin } = useAuth()

  const [query, setQuery] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanNotice, setScanNotice] = useState('')
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)

  function onSearch(e) {
    e.preventDefault()

    navigate(
      `/shop${query ? `?search=${encodeURIComponent(query)}` : ''}`
    )

    setMenuOpen(false)
  }

  function openCameraSearch() {
    cameraInputRef.current?.click()
  }

  // Product camera/image search: captures or picks a photo from the device.
  // There is no image-recognition service wired up yet, so this hands the
  // shopper off to the shop page — the capture UI is ready to connect to a
  // real visual-search API later.
  function onImageCapture(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setScanNotice('')

    setTimeout(() => {
      setScanning(false)
      setScanNotice('Visual search needs an image-recognition service connected — showing all products for now.')
      navigate('/shop')
      setMenuOpen(false)
      e.target.value = ''
      setTimeout(() => setScanNotice(''), 5000)
    }, 700)
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">

      {/* Promo bar */}
      <div className="bg-ink-900 text-white text-xs overflow-hidden">
        <div className="container-px max-w-7xl mx-auto flex items-center gap-3 sm:gap-6 py-1.5">

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="marquee-track flex items-center gap-10 whitespace-nowrap w-max">
              {[...promoMessages, ...promoMessages].map((msg, i) => (
                <span key={i}>{msg}</span>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 sm:gap-4 shrink-0 font-medium">
            {topLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="hover:text-brand-300 whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Main header */}
      <div className="container-px max-w-7xl mx-auto flex items-center gap-4 py-3">

        {/* Logo */}
        <Link
          to="/"
          className="flex flex-col leading-none shrink-0"
        >
          <span className="text-2xl font-extrabold font-display tracking-tight">
            <span className="text-brand-600">
              KNOVIX
            </span>
          </span>

          <span className="text-[10px] tracking-[0.3em] text-slate-500">
            GADGETS
          </span>
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
            className="input rounded-none rounded-l-md"
          />

          <button
            type="button"
            onClick={openCameraSearch}
            aria-label="Search by photo"
            title="Search by photo"
            className="px-3 border-y border-slate-300 bg-white text-slate-500 hover:text-brand-700"
          >
            <IconCamera className="w-5 h-5" />
          </button>

          <button
            type="submit"
            aria-label="Search"
            className="btn-primary rounded-l-none px-4"
          >
            <IconSearch className="w-4 h-4" />
          </button>
        </form>

        {/* Hidden input powering the camera / photo search button */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onImageCapture}
        />

        {/* Mobile quick links: Deals / New Arrivals / Brands, right side of header */}
        <nav className="lg:hidden flex items-center gap-1.5 ml-auto text-[11px] font-medium overflow-x-auto no-scrollbar">
          {topLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="whitespace-nowrap bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 rounded-full px-2.5 py-1"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Header actions */}
        <div className="flex items-center gap-5 text-sm lg:ml-auto">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="hidden lg:flex flex-col items-center text-slate-600 hover:text-brand-700"
          >
            <span className="relative">
              <IconHeart className="w-5 h-5" />
              {wishCount > 0 && (
                <sup className="absolute -top-1 -right-2 text-[10px]">{wishCount}</sup>
              )}
            </span>

            <span className="text-xs">
              Wishlist
            </span>
          </Link>

          {/* Account */}
          <div className="relative group hidden lg:block">

            <button
              type="button"
              className="flex flex-col items-center text-slate-600 hover:text-brand-700"
            >
              <IconUser className="w-5 h-5" />

              <span className="text-xs">
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
            <IconCart className="w-5 h-5" />

            <span className="text-xs">
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

      {/* Image-search status notice */}
      {(scanning || scanNotice) && (
        <div className="lg:hidden bg-brand-50 text-brand-700 text-xs text-center py-1.5 px-3">
          {scanning ? 'Analyzing photo…' : scanNotice}
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-3">

          {/* Mobile search */}
          <form
            onSubmit={onSearch}
            className="flex"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="input rounded-none rounded-l-md flex-1"
            />

            <button
              type="button"
              onClick={openCameraSearch}
              aria-label="Search by photo"
              className="px-3 border-y border-slate-300 bg-white text-slate-500"
            >
              <IconCamera className="w-5 h-5" />
            </button>

            <button
              type="submit"
              aria-label="Search"
              className="btn-primary rounded-l-none px-4"
            >
              <IconSearch className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile navigation */}
          <nav className="flex flex-col space-y-1">

            {navLinks.map((l) => (
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
                  <IconUser className="w-4 h-4" /> My Account
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
              <IconCart className="w-4 h-4" /> Cart
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

import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { mobileNavLinks } from '../data/navLinks'
import { AccountIcon, CartIcon, ChevronRightIcon, CloseIcon } from './Icons'

const rowClass = ({ isActive } = {}) =>
  `flex items-center justify-between gap-3 h-12 px-4 text-[15px] leading-none ${
    isActive ? 'text-brand-700 font-medium bg-brand-50' : 'text-slate-700 active:bg-slate-50'
  }`

export default function MobileMenuSheet({ menuOpen, setMenuOpen }) {
  const { count } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const panelRef = useRef(null)

  const close = () => setMenuOpen(false)

  // Standard bottom-sheet behavior: dismiss when the user scrolls the page
  // behind it, or taps anywhere outside the panel.
  useEffect(() => {
    if (!menuOpen) return

    function onScroll() {
      close()
    }
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) close()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('touchstart', onClickOutside)
    document.addEventListener('mousedown', onClickOutside)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('touchstart', onClickOutside)
      document.removeEventListener('mousedown', onClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen])

  if (!menuOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop — tapping it (or scrolling) closes the sheet */}
      <div
        className="absolute inset-0 bg-black/40 animate-[fade-in_0.2s_ease-out]"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute bottom-0 inset-x-0 max-h-[78vh] bg-white rounded-t-2xl shadow-xl flex flex-col animate-[sheet-up_0.25s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <h2 className="font-semibold text-base">Menu</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <CloseIcon className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+8px)]">
          {/* Primary nav — standard, uniform row height like Amazon's menu */}
          <nav className="divide-y divide-slate-100 border-y border-slate-100">
            {mobileNavLinks.map((l) => (
              <NavLink key={l.label} to={l.to} onClick={close} className={rowClass} end={l.to === '/'}>
                <span>{l.label}</span>
                <ChevronRightIcon className="w-4 h-4 text-slate-300" />
              </NavLink>
            ))}
          </nav>

          {/* Account */}
          <div className="mt-2 divide-y divide-slate-100 border-y border-slate-100">
            {user ? (
              <>
                <Link to="/account" onClick={close} className={rowClass()}>
                  <span className="flex items-center gap-3">
                    <AccountIcon className="w-4.5 h-4.5 text-slate-400" /> My Account
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                </Link>

                {isAdmin && (
                  <Link to="/admin" onClick={close} className={rowClass()}>
                    <span>Admin Panel</span>
                    <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => { logout(); close() }}
                  className="flex items-center h-12 px-4 text-[15px] leading-none text-red-600 w-full text-left active:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close} className={rowClass()}>
                  <span>Login</span>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
                <Link to="/signup" onClick={close} className={rowClass()}>
                  <span>Sign Up</span>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                </Link>
              </>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" onClick={close} className="flex items-center justify-between h-12 px-4 mt-2 text-[15px] leading-none text-slate-700 active:bg-slate-50">
            <span className="flex items-center gap-3">
              <CartIcon className="w-4.5 h-4.5 text-slate-400" /> Cart
            </span>
            {count > 0 && (
              <span className="bg-brand-600 text-white text-xs rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}

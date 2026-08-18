import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { HomeIcon, ShopIcon, AccountIcon, CartIcon, MenuIcon } from './Icons'

const tabClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] ${
    isActive ? 'text-brand-700' : 'text-slate-500'
  }`

export default function BottomNav({ menuOpen, setMenuOpen }) {
  const { count } = useCart()
  const { user } = useAuth()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex items-stretch pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/" end className={tabClass}>
        <HomeIcon className="w-5 h-5" />
        Home
      </NavLink>

      <NavLink to="/shop" className={tabClass}>
        <ShopIcon className="w-5 h-5" />
        Shop
      </NavLink>

      <NavLink to={user ? '/account' : '/login'} className={tabClass}>
        <AccountIcon className="w-5 h-5" />
        Account
      </NavLink>

      <NavLink to="/cart" className={tabClass}>
        <span className="relative">
          <CartIcon className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-brand-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </span>
        Cart
      </NavLink>

      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] ${
          menuOpen ? 'text-brand-700' : 'text-slate-500'
        }`}
      >
        <MenuIcon className="w-5 h-5" />
        Menu
      </button>
    </nav>
  )
}

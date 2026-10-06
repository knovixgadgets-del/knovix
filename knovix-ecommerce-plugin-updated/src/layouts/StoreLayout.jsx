import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import MobileMenuSheet from '../components/MobileMenuSheet'

export default function StoreLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Home page ends in a flush newsletter -> footer join (no white gap); the
  // space for the mobile bottom nav then lives inside the dark footer.
  const isHome = useLocation().pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className={`flex-1 ${isHome ? '' : 'pb-16 lg:pb-0'}`}>
        <Outlet />
      </main>

      <Footer flush={isHome} />

      <BottomNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <MobileMenuSheet menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </div>
  )
}

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import MobileMenuSheet from '../components/MobileMenuSheet'
import ScrollToTop from '../components/ScrollToTop'
import { homeShow } from '../data/homeContent'

export default function StoreLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Home page ends in a flush newsletter -> footer join (no white gap); the
  // space for the mobile bottom nav then lives inside the dark footer.
  const flush = useLocation().pathname === '/' && homeShow.newsletter

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-ink-900 focus:px-4 focus:py-2 focus:rounded-md focus:shadow-card"
      >
        Skip to content
      </a>

      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main id="main" className={`flex-1 ${flush ? '' : 'pb-16 lg:pb-0'}`}>
        <Outlet />
      </main>

      <Footer flush={flush} />

      <BottomNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <MobileMenuSheet menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </div>
  )
}

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'

export default function StoreLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <Footer />

      <BottomNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
    </div>
  )
}
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
<<<<<<< HEAD
      <main className="flex-1 pb-16 lg:pb-0">
=======
      <main className="flex-1 pb-16 md:pb-0">
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
        <Outlet />
      </main>
      <Footer />
      <BottomNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </div>
  )
}

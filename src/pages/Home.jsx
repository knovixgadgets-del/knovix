import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../api/products'
import { testimonials } from '../data/mockData'

const perks = [
  ['🚚', 'Free Shipping Across India', 'On orders above ₹499'],
  ['🔄', '7-Day Easy Replacement', 'For damaged or defective products'],
  ['🛡️', '100% Secure Payments', 'Multiple secure payment options'],
  ['🎧', '24/7 Customer Support', "We're here to help anytime, anywhere"]
]

function useCountdown(hours = 51) {
  const [target] = useState(() => Date.now() + hours * 3600 * 1000)
  const [left, setLeft] = useState(target - Date.now())
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(t)
  }, [target])
  const d = Math.floor(left / 86400000)
  const h = Math.floor((left % 86400000) / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return { d, h, m, s }
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const { d, h, m, s } = useCountdown()

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
    getProducts().then(setProducts).catch(() => setProducts([]))
  }, [])

  const featured = products.filter((p) => p.featured)
  const bestSellers = products.filter((p) => p.bestSeller)

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-50 to-teal-50">
        <div className="container-px max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center py-14">
          <div>
            <span className="badge-off inline-block mb-4">NEW COLLECTION</span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Smart Gadgets.<br /><span className="text-brand-600">Smarter</span> Living.
            </h1>
            <p className="mt-4 text-slate-600 max-w-md">
              Premium gadgets and accessories to upgrade your lifestyle with the best technology.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/shop" className="btn-primary">Shop Now →</Link>
              <Link to="/shop?sort=price_asc" className="btn-outline bg-white">Explore Deals</Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format"
              alt="Smart gadgets collection"
              className="rounded-2xl w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {perks.map(([icon, title, desc]) => (
          <div key={title} className="card p-4 flex items-start gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="container-px max-w-7xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shop by Category</h2>
          <Link to="/shop" className="text-brand-700 text-sm font-medium">View all Categories →</Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.id}`} className="text-center group">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs mt-1.5 font-medium">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link to="/shop" className="text-brand-700 text-sm font-medium">View all Products →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold flex items-center gap-1">⚡ FLASH SALE</p>
            <h3 className="text-2xl font-bold mt-1">Mega Deals on Top Gadgets!</h3>
            <p className="text-sm text-brand-100">Limited time offers. Grab before it's gone.</p>
          </div>
          <div className="flex gap-3 text-center">
            {[['Days', d], ['Hours', h], ['Minutes', m], ['Seconds', s]].map(([label, val]) => (
              <div key={label} className="bg-black/30 rounded-lg px-3 py-2 min-w-[60px]">
                <p className="text-xl font-bold">{String(val).padStart(2, '0')}</p>
                <p className="text-[10px] uppercase">{label}</p>
              </div>
            ))}
          </div>
          <Link to="/shop" className="btn-dark bg-black">Shop the Sale</Link>
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Best Sellers</h2>
          <Link to="/shop" className="text-brand-700 text-sm font-medium">View all Products →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto py-10">
        <h2 className="text-xl font-bold text-center mb-6">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-5">
              <p className="text-amber-400 text-sm">{'★'.repeat(t.rating)}</p>
              <p className="text-sm text-slate-600 mt-2">"{t.text}"</p>
              <p className="text-sm font-semibold mt-3">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-50">
        <div className="container-px max-w-7xl mx-auto py-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Get Exclusive Offers & Updates</h3>
            <p className="text-sm text-slate-600">Subscribe now and get ₹100 off on your first order!</p>
          </div>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="Enter your email address" className="input w-64" />
            <button className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}

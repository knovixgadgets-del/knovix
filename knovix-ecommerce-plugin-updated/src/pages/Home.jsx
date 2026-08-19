import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import HeroCarousel from '../components/HeroCarousel'
import { CategoryIcon } from '../components/Icons'
import { getCategories, getProducts } from '../api/products'
import { testimonials } from '../data/mockData'

const perks = [
  ['🚚', 'Free Shipping Across India', 'On orders above ₹199'],
  ['🔄', '7-Day Easy Replacement', 'For damaged or defective products'],
  ['🛡️', '100% Secure Payments', 'Multiple secure payment options'],
  ['💬', '24/7 Customer Support', "We're here to help anytime, anywhere"]
]

const heroGradients = [
  'from-brand-700 to-brand-900',
  'from-ink-900 to-brand-800',
  'from-teal-700 to-brand-900'
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

function ProductGridSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3">
          <div className="aspect-square rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-3 rounded bg-slate-100 animate-pulse mt-3 w-3/4" />
          <div className="h-3 rounded bg-slate-100 animate-pulse mt-2 w-1/2" />
          <div className="h-9 rounded bg-slate-100 animate-pulse mt-3" />
        </div>
      ))}
    </div>
  )
}

// A broken/missing category image used to fall through to the browser's
// default broken-image icon, which renders at its own intrinsic size and
// spills text out of the card instead of staying inside the fixed square —
// this swaps in a clean placeholder the moment the image errors out.
function CategoryThumb({ image, name }) {
  const [errored, setErrored] = useState(false)
  const showFallback = !image || errored

  return (
    <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
      {showFallback ? (
        <CategoryIcon className="w-6 h-6 text-slate-300" />
      ) : (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}

function LoadErrorNotice({ onRetry, label }) {
  return (
    <div className="card p-4 flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">Couldn't load {label} right now.</span>
      <button type="button" onClick={onRetry} className="btn-outline shrink-0 h-9 px-4 text-xs">
        Retry
      </button>
    </div>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)

  const { d, h, m, s } = useCountdown()

  const loadCategories = useCallback(() => {
    setCategoriesLoading(true)
    setCategoriesError(false)
    getCategories()
      .then((items) => setCategories(Array.isArray(items) ? items : []))
      .catch(() => setCategoriesError(true))
      .finally(() => setCategoriesLoading(false))
  }, [])

  const loadProducts = useCallback(() => {
    setProductsLoading(true)
    setProductsError(false)
    getProducts()
      .then((items) => setProducts(Array.isArray(items) ? items : []))
      .catch(() => setProductsError(true))
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [loadCategories, loadProducts])

  const featured = products.filter((p) => p.featured)
  const bestSellers = products.filter((p) => p.bestSeller)

  // Hero slides: built from real, hyperlinked catalog data — prefer
  // featured products, falling back to whatever's loaded — instead of
  // stock/decorative imagery.
  const heroSource = (featured.length > 0 ? featured : products).slice(0, 3)
  const heroSlides = heroSource.map((p, i) => ({
    id: p.id,
    href: `/product/${p.id}`,
    image: p.image,
    gradient: heroGradients[i % heroGradients.length],
    eyebrow: i === 0 ? 'NEW ARRIVALS' : 'FEATURED',
    title: i === 0 ? 'New Arrivals. Winter Sale.' : p.name,
    subtitle: i === 0 ? 'Premium gadgets and accessories to upgrade your lifestyle.' : p.description,
    cta: 'Shop Now'
  }))

  return (
    <div>
      <HeroCarousel slides={heroSlides} />

      <section className="container-px max-w-7xl mx-auto py-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {perks.map(([icon, title, desc]) => (
          <div key={title} className="card px-3 py-2.5 flex items-center gap-2.5">
            <span className="text-lg shrink-0">{icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-[13px] leading-tight truncate">{title}</p>
              <p className="text-[11px] text-slate-500 leading-snug truncate">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="container-px max-w-7xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Shop by Category</h2>
          <Link to="/shop" className="text-brand-700 text-sm font-medium">View all →</Link>
        </div>

        {categoriesError ? (
          <LoadErrorNotice label="categories" onRetry={loadCategories} />
        ) : categoriesLoading ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-3 rounded bg-slate-100 animate-pulse mt-2 w-4/5 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((c) => (
              <Link key={c.id} to={`/shop?category=${c.id}`} className="block text-center group w-full min-w-0">
                <CategoryThumb image={c.image} name={c.name} />
                <p className="text-xs mt-1.5 font-medium truncate w-full">{c.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container-px max-w-7xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Featured Products</h2>
          <Link to="/shop" className="text-brand-700 text-sm font-medium">View all →</Link>
        </div>

        {productsError ? (
          <LoadErrorNotice label="featured products" onRetry={loadProducts} />
        ) : productsLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="container-px max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold flex items-center gap-1">⚡ FLASH SALE</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">Mega Deals on Top Gadgets!</h3>
            <p className="text-sm text-brand-100">Limited time offers. Grab before it's gone.</p>
          </div>
          <div className="flex gap-2 sm:gap-3 text-center">
            {[['Days', d], ['Hours', h], ['Minutes', m], ['Seconds', s]].map(([label, val]) => (
              <div key={label} className="bg-black/30 rounded-lg px-2.5 sm:px-3 py-2 min-w-[52px] sm:min-w-[60px]">
                <p className="text-lg sm:text-xl font-bold">{String(val).padStart(2, '0')}</p>
                <p className="text-[10px] uppercase">{label}</p>
              </div>
            ))}
          </div>
          <Link to="/shop" className="btn-dark bg-black">Shop the Sale</Link>
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Best Sellers</h2>
          <Link to="/shop" className="text-brand-700 text-sm font-medium">View all →</Link>
        </div>

        {productsError ? (
          <LoadErrorNotice label="best sellers" onRetry={loadProducts} />
        ) : productsLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="container-px max-w-7xl mx-auto py-8">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-5">What Our Customers Say</h2>
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
        <div className="container-px max-w-7xl mx-auto py-7 flex flex-wrap items-center justify-between gap-4">
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

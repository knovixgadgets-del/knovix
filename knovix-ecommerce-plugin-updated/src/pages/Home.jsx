import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import HeroCarousel from '../components/HeroCarousel'
import { CategoryIcon } from '../components/Icons'
import { getCategories, getProducts } from '../api/products'

const perks = [
  ['🚚', 'Free Shipping Across India', 'On orders above ₹199'],
  ['🔄', '7-Day Easy Replacement', 'For damaged or defective products'],
  ['🛡️', '100% Secure Payments', 'Multiple secure payment options'],
  ['💬', '24/7 Customer Support', "We're here to help anytime, anywhere"]
]

// Amazon-style single-day deal cycle: the countdown always shows how much
// of *today* is left (hours/minutes/seconds only, no "days"), and quietly
// rolls over to a fresh 24h window at midnight — same behavior as Amazon's
// nightly-resetting "Deal of the Day" timer.
function endOfToday() {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return end.getTime()
}

function useDealCountdown() {
  const [target, setTarget] = useState(endOfToday)
  const [left, setLeft] = useState(() => target - Date.now())

  useEffect(() => {
    const t = setInterval(() => {
      const remaining = target - Date.now()
      if (remaining <= 0) {
        setTarget(endOfToday() + 86400000)
      } else {
        setLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [target])

  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return { h, m, s }
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
function CategoryThumb({ image, name, rounded = 'rounded-xl' }) {
  const [errored, setErrored] = useState(false)
  const showFallback = !image || errored

  return (
    <div className={`aspect-square ${rounded} overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center`}>
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

  const { h, m, s } = useDealCountdown()

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

  // Mega Deals rail — the biggest real discounts in the catalog, ranked by
  // % off (mrp vs price), the way Amazon's deals rail surfaces its steepest
  // markdowns rather than a fixed/curated list.
  const dealProducts = useMemo(
    () =>
      [...products]
        .filter((p) => Number(p.mrp) > Number(p.price))
        .sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)
        .slice(0, 8),
    [products]
  )

  // Hero slides: built from real, hyperlinked catalog data — prefer
  // featured products, falling back to whatever's loaded — instead of
  // stock/decorative imagery.
  const heroSource = (featured.length > 0 ? featured : products).slice(0, 3)
  const heroSlides = heroSource.map((p, i) => ({
    id: p.id,
    href: `/product/${p.id}`,
    image: p.image,
    eyebrow: i === 0 ? 'NEW ARRIVALS' : 'FEATURED',
    title: i === 0 ? 'New Arrivals. Winter Sale.' : p.name,
    subtitle: i === 0 ? 'Premium gadgets and accessories to upgrade your lifestyle.' : p.description,
    cta: 'Shop Now'
  }))

  return (
    <div>
      {/* Real, crawlable heading — the hero carousel below is decorative and
          only ever renders an <h2>, so the page previously shipped with no
          <h1> at all. Kept compact since the hero carries the visual weight. */}
      <section className="container-px max-w-7xl mx-auto pt-4 pb-2">
        <h1 className="text-lg sm:text-xl font-bold font-display">
          Knovix – Smart Gadgets. Smarter Living.
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Discover smart gadgets, mobile accessories, electronics, toys and
          everyday technology at Knovix Gadgets.
        </p>
      </section>

      {/* Flipkart-style round category strip, sitting right above the
          banner so shoppers can jump to a category before they even scroll. */}
      <section className="container-px max-w-7xl mx-auto pb-3">
        {categoriesError ? (
          <LoadErrorNotice label="categories" onRetry={loadCategories} />
        ) : (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
            {(categoriesLoading ? Array.from({ length: 8 }) : categories).map((c, i) => (
              categoriesLoading ? (
                <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                  <div className="w-14 h-14 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-2.5 w-10 rounded bg-slate-100 animate-pulse" />
                </div>
              ) : (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.id}`}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-16 text-center group"
                >
                  <span className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 group-hover:border-brand-300 transition-colors">
                    <CategoryThumb image={c.image} name={c.name} rounded="rounded-full" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight line-clamp-2">{c.name}</span>
                </Link>
              )
            ))}
          </div>
        )}
      </section>

      <HeroCarousel slides={heroSlides} />

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

      {/* Mega Deals — Amazon-style deals rail: a slim countdown ribbon
          (resets every 24h, see useDealCountdown above) followed by a
          horizontally-scrolling row of the catalog's steepest discounts,
          instead of a single static banner. */}
      <section className="container-px max-w-7xl mx-auto py-6">
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3">
            <div>
              <p className="text-xs font-semibold flex items-center gap-1">⚡ FLASH SALE</p>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5">Mega Deals on Top Gadgets!</h2>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-medium hidden sm:inline">Deal ends in</span>
              {[['HH', h], ['MM', m], ['SS', s]].map(([label, val]) => (
                <span key={label} className="bg-black/30 rounded-md px-2.5 py-1.5 min-w-[42px] text-center">
                  <span className="font-bold font-mono text-sm sm:text-base">{String(val).padStart(2, '0')}</span>
                  <span className="block text-[9px] uppercase leading-none mt-0.5">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {productsError ? (
          <div className="mt-4"><LoadErrorNotice label="deals" onRetry={loadProducts} /></div>
        ) : productsLoading ? (
          <div className="mt-4"><ProductGridSkeleton /></div>
        ) : dealProducts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar mt-4 pb-1">
            {dealProducts.map((p) => (
              <div key={p.id} className="w-40 sm:w-48 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : null}

        <div className="text-right mt-2">
          <Link to="/shop" className="text-brand-700 text-sm font-medium">See all deals →</Link>
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

      {/* Trust-badge strip — kept as the very last section of the page so
          it sits directly above the global footer, the way Amazon places
          its shipping/returns/payment/support reassurance band. */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="container-px max-w-7xl mx-auto py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 md:divide-x md:divide-slate-200">
          {perks.map(([icon, title, desc]) => (
            <div key={title} className="flex flex-col items-center text-center gap-2 px-2 md:px-4">
              <span className="w-12 h-12 rounded-full bg-white shadow-card flex items-center justify-center text-2xl">
                {icon}
              </span>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

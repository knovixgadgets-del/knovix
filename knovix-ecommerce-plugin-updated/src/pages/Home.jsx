import { useShippingRules } from '../utils/shipping'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import HeroCarousel from '../components/HeroCarousel'
import { homeBanners } from '../data/homeBanners'
import { CategoryIcon } from '../components/Icons'
import { getCategories, getProducts } from '../api/products'

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
  const [left, setLeft] = useState(() => endOfToday() - Date.now())

  useEffect(() => {
    const t = setInterval(() => {
      // Recompute against *today's* end each tick, so after midnight the
      // timer restarts at 24h instead of showing an extra day (was 47:59:59).
      setLeft(endOfToday() - Date.now())
    }, 1000)
    return () => clearInterval(t)
  }, [])

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

// Dark category tile from the third theme. A broken/missing image swaps to a
// clean placeholder instead of the browser's default broken-image icon.
function CategoryTile({ category }) {
  const [errored, setErrored] = useState(false)
  const showFallback = !category.image || errored
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-400/50 transition-colors p-3 h-full"
    >
      <div className="aspect-[4/5] rounded-xl flex items-center justify-center overflow-hidden">
        {showFallback ? (
          <CategoryIcon className="w-10 h-10 text-white/20" />
        ) : (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setErrored(true)}
          />
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-white truncate">{category.name}</p>
      <p className="text-[11px] text-slate-400 group-hover:text-amber-400 transition-colors">Shop Now →</p>
    </Link>
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
  const { freeMin } = useShippingRules()
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

  // Hero slides: the dark "Upgrade Your Everyday Tech" theme, each slide
  // paired with a real catalog product (featured first) and linked to it.
  const heroProducts = (featured.length > 0 ? featured : products).slice(0, 8)
  const heroSlides = homeBanners

  return (
    <div>
      {/* Visually hidden but still a real, crawlable <h1> for SEO. */}
      <h1 className="sr-only">Knovix – Smart Gadgets. Smarter Living.</h1>

      <div className="bg-ink-900">
        <HeroCarousel slides={heroSlides} products={heroProducts} loading={productsLoading} freeMin={freeMin} />

        <section className="container-px max-w-7xl mx-auto pt-2 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">Shop By Category</h2>
            <Link to="/shop" className="text-amber-400 text-sm font-medium">View All Categories →</Link>
          </div>

          {categoriesError ? (
            <LoadErrorNotice label="categories" onRetry={loadCategories} />
          ) : categoriesLoading ? (
            <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 lg:w-auto shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="aspect-[4/5] rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-3 rounded bg-white/10 animate-pulse mt-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto lg:overflow-visible no-scrollbar snap-x lg:[&>*:nth-child(n+7)]:hidden">
              {categories.slice(0, 12).map((c) => (
                <div key={c.id} className="w-36 sm:w-44 lg:w-auto shrink-0 snap-start">
                  <CategoryTile category={c} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {(productsLoading || productsError || featured.length > 0) && (
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
      )}

      {/* Mega Deals — Amazon-style deals rail: a slim countdown ribbon
          (resets every 24h, see useDealCountdown above) followed by a
          horizontally-scrolling row of the catalog's steepest discounts,
          instead of a single static banner. */}
      <section className="container-px max-w-7xl mx-auto py-6">
        <div className="rounded-xl overflow-hidden flash-sale-bg text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3">
            <div>
              <p className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide bg-amber-400 text-ink-900 rounded-full px-2.5 py-0.5">⚡ FLASH SALE</p>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5">Mega Deals on Top Gadgets!</h2>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-medium hidden sm:inline">Deal ends in</span>
              {[['HH', h], ['MM', m], ['SS', s]].map(([label, val]) => (
                <span key={label} className="bg-white/10 ring-1 ring-white/25 backdrop-blur-sm rounded-md px-2.5 py-1.5 min-w-[42px] text-center">
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

      {(productsLoading || productsError || bestSellers.length > 0) && (
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
      )}

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

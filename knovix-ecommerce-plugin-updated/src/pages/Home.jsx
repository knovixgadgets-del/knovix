import { useShippingRules } from '../utils/shipping'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import HomeBannerSlider from '../components/HomeBannerSlider'
import CategoryTabs from '../components/CategoryTabs'
import MiniProductRail from '../components/MiniProductRail'
import { homeBanners } from '../data/homeBanners'
import { homeShow, categoryTabs, trustBadges, lookingRail, promoTiles } from '../data/homeContent'
import { useAuth } from '../context/AuthContext'
import { CategoryIcon, TruckIcon, PhoneIcon, BoxIcon, CheckCircleIcon } from '../components/Icons'
import '../styles/home.css'
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
      className="group block rounded-2xl border border-slate-200 bg-white hover:border-brand-400 hover:shadow-card transition p-3 h-full"
    >
      <div className="aspect-[4/5] rounded-xl flex items-center justify-center overflow-hidden">
        {showFallback ? (
          <CategoryIcon className="w-10 h-10 text-slate-300" />
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
      <p className="mt-2 text-sm font-semibold text-ink-900 truncate">{category.name}</p>
      <p className="text-[11px] text-slate-400 group-hover:text-brand-700 transition-colors">Shop Now →</p>
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

const BADGE_ICONS = { truck: TruckIcon, phone: PhoneIcon, box: BoxIcon, check: CheckCircleIcon }

// Products the visitor opened before (saved by the product page).
function readRecentViewed() {
  try {
    const list = JSON.parse(localStorage.getItem('knovix_recently_viewed')) || []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function TrustStrip({ freeMin }) {
  return (
    <section className="container-px max-w-7xl mx-auto pt-2.5">
      <div className="panel !py-3 flex lg:grid lg:grid-cols-4 gap-x-6 gap-y-3 overflow-x-auto no-scrollbar">
        {trustBadges.map(({ icon, title, sub, href }) => {
          const Icon = BADGE_ICONS[icon] || CheckCircleIcon
          const text = String(sub || '').replace('{freeMin}', freeMin ?? '')
          const inner = (
            <>
              <span className="w-9 h-9 shrink-0 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="leading-tight whitespace-nowrap">
                <span className="block text-xs font-semibold text-ink-900">{title}</span>
                <span className="block text-[11px] text-slate-500">{text}</span>
              </span>
            </>
          )
          return href ? (
            <a key={title} href={href} className="flex items-center gap-2.5 shrink-0">{inner}</a>
          ) : (
            <div key={title} className="flex items-center gap-2.5 shrink-0">{inner}</div>
          )
        })}
      </div>
    </section>
  )
}

function PromoTiles() {
  if (!promoTiles.length) return null
  return (
    <section className="container-px max-w-7xl mx-auto py-2.5">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
        {promoTiles.map((t) => (
          <Link
            key={t.id}
            to={t.href}
            className="group relative block aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 shadow-card"
          >
            <img src={t.image} alt={t.label || ''} loading="lazy" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
            {t.tag && (
              <span className="absolute top-2 right-2 rounded-md bg-white/85 px-1.5 py-0.5 text-[10px] font-bold text-ink-900">{t.tag}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
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

  // "Still looking for these?" row — editable in src/data/homeContent.js
  const { user } = useAuth()
  const firstName = String(user?.name || '').trim().split(/\s+/)[0]
  const pickSource = (name) =>
    name === 'featured' ? featured
    : name === 'deals' ? dealProducts
    : name === 'bestSellers' ? bestSellers
    : products
  const recentEntries = useMemo(() => readRecentViewed(), [])
  const recentProducts = recentEntries
    .map((e) => products.find((p) => String(p.id) === String(e.id)) || e)
    .slice(0, lookingRail.max)
  const useRecent = lookingRail.source === 'recent' && recentProducts.length > 0
  const railProducts = useRecent
    ? recentProducts
    : pickSource(lookingRail.source === 'recent' ? lookingRail.fallbackSource : lookingRail.source).slice(0, lookingRail.max)
  const railTitle = useRecent || lookingRail.source !== 'recent'
    ? (firstName && lookingRail.titleWithName
        ? lookingRail.titleWithName.replace('{name}', firstName)
        : lookingRail.title)
    : lookingRail.fallbackTitle

  return (
    <div>
      {/* Visually hidden but still a real, crawlable <h1> for SEO. */}
      <h1 className="sr-only">Knovix – Smart Gadgets. Smarter Living.</h1>

      {/* Home layout: edit what shows in src/data/homeContent.js */}
      {homeShow.categoryTabs && <CategoryTabs tabs={categoryTabs} categories={categories} />}

      <div className="page-bg pb-2">
      {homeShow.banners && <HomeBannerSlider slides={homeBanners} />}
      {homeShow.trustBadges && <TrustStrip freeMin={freeMin} />}
      {homeShow.lookingRail && !productsLoading && !productsError && (
        <MiniProductRail title={railTitle} products={railProducts} />
      )}
      {homeShow.promoTiles && <PromoTiles />}

      {homeShow.categoryGrid && (
        <section className="container-px max-w-7xl mx-auto py-2.5"><div className="panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Shop By Category</h2>
            <Link to="/shop" className="text-brand-700 text-sm font-medium">View all →</Link>
          </div>

          {categoriesError ? (
            <LoadErrorNotice label="categories" onRetry={loadCategories} />
          ) : categoriesLoading ? (
            <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 lg:w-auto shrink-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />
                  <div className="h-3 rounded bg-slate-100 animate-pulse mt-3 w-3/4" />
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
        </div></section>
      )}

      {homeShow.featured && (productsLoading || productsError || featured.length > 0) && (
      <section className="container-px max-w-7xl mx-auto py-2.5"><div className="panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Featured Products</h2>
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
      </div></section>
      )}

      {/* Mega Deals — Amazon-style deals rail: a slim countdown ribbon
          (resets every 24h, see useDealCountdown above) followed by a
          horizontally-scrolling row of the catalog's steepest discounts,
          instead of a single static banner. */}
      {homeShow.deals && (
      <section className="container-px max-w-7xl mx-auto py-2.5"><div className="panel">
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
      </div></section>
      )}

      {homeShow.bestSellers && (productsLoading || productsError || bestSellers.length > 0) && (
      <section className="container-px max-w-7xl mx-auto py-2.5"><div className="panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Best Sellers</h2>
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
      </div></section>
      )}

      </div>

      {homeShow.newsletter && (
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
      )}

    </div>
  )
}

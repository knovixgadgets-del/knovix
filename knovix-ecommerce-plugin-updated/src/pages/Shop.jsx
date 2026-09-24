import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../api/products'
import {
  BoltIcon,
  BottleIcon,
  CategoryIcon,
  HangerIcon,
  HeadphonesIcon,
  HeartPulseIcon,
  ShopIcon,
  TagIcon
} from '../components/Icons'

// Picks a tab icon from the category name so tabs look like the app UI
// (Beauty → bottle, Fashion → hanger, Health → heart-pulse …).
function iconForCategory(name = '') {
  const n = name.toLowerCase()
  if (/beauty|care|groom|skin|cosmetic/.test(n)) return BottleIcon
  if (/fashion|cloth|wear|apparel|watch/.test(n)) return HangerIcon
  if (/health|fitness|wellness/.test(n)) return HeartPulseIcon
  if (/audio|head|ear|speaker|sound|music/.test(n)) return HeadphonesIcon
  if (/home|kitchen|living|appliance/.test(n)) return ShopIcon
  return TagIcon
}

function CategoryTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 flex flex-col items-center gap-1 px-4 pt-3 pb-2.5 text-[15px] transition-colors ${
        active ? 'text-ink-900 font-semibold' : 'text-slate-500'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="whitespace-nowrap">{label}</span>
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-12 rounded-full bg-orange-500" />
      )}
    </button>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)

  // URL parameters
  const category = params.get('category') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || ''
  const visualSearch = params.get('visualSearch') === '1'

  // Load categories
  useEffect(() => {
    getCategories()
      .then((items) => {
        setCategories(items)
      })
      .catch(() => {
        setCategories([])
      })
  }, [])

  // Load products
  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    getProducts({
      category,
      search,
      sort,
    })
      .then((items) => {
        if (cancelled) return

        setProducts(Array.isArray(items) ? items : [])
      })
      .catch(() => {
        if (cancelled) return

        setProducts([])
        setError("Couldn't load products right now. Please try again.")
      })
      .finally(() => {
        if (cancelled) return

        setLoading(false)
      })

    // Prevent state updates if component is unmounted
    return () => {
      cancelled = true
    }
  }, [category, search, sort, retryKey])

  // Apply maximum price filter
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const price = Number(p.price) || 0
      return price <= maxPrice
    })
  }, [products, maxPrice])

  // Update URL parameter
  function setParam(key, value) {
    const next = new URLSearchParams(params)

    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }

    setParams(next)
  }

  // Get current category name
  const currentCategoryName = categories.find(
    (c) => String(c.id) === String(category)
  )?.name

  return (
    <div className="bg-[#f6f4fb] min-h-[60vh]">

      {/* Category tab strip — icon + label tabs with an underline on the
          active one (Deals, All, then each store category). Desktop keeps
          the sidebar category list below instead. */}
      <div className="md:hidden bg-white border-b border-slate-100 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar px-1">
          <CategoryTab
            icon={BoltIcon}
            label="Deals"
            active={sort === 'price_asc' && !category}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete('category')
              next.set('sort', 'price_asc')
              setParams(next)
            }}
          />
          <CategoryTab
            icon={CategoryIcon}
            label="All"
            active={!category && sort !== 'price_asc'}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete('category')
              if (sort === 'price_asc') next.delete('sort')
              setParams(next)
            }}
          />
          {categories.map((c) => (
            <CategoryTab
              key={c.id}
              icon={iconForCategory(c.name)}
              label={c.name}
              active={String(category) === String(c.id)}
              onClick={() => setParam('category', String(c.id))}
            />
          ))}
        </div>
      </div>

    <div className="container-px max-w-7xl mx-auto py-4 md:py-8 grid md:grid-cols-[220px_1fr] gap-4 md:gap-8">

      {/* Sidebar */}
      <aside className="space-y-6">

        {/* Category (desktop — mobile uses the tab strip above) */}
        <div className="hidden md:block">
          <h3 className="font-semibold mb-2 text-sm">
            Category
          </h3>

          <ul className="space-y-1 text-sm">

            {/* All Products */}
            <li>
              <button
                onClick={() => setParam('category', '')}
                className={
                  !category
                    ? 'text-brand-700 font-medium'
                    : 'text-slate-600'
                }
              >
                All Products
              </button>
            </li>

            {/* Categories */}
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setParam('category', String(c.id))}
                  className={
                    String(category) === String(c.id)
                      ? 'text-brand-700 font-medium'
                      : 'text-slate-600'
                  }
                >
                  {c.name}
                </button>
              </li>
            ))}

          </ul>
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="font-semibold mb-2 text-sm">
            Max Price: ₹{maxPrice}
          </h3>

          <input
            type="range"
            min="300"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>

      </aside>

      {/* Products Area */}
      <div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

          <h1 className="text-xl font-bold">

            {category
              ? currentCategoryName || 'Products'
              : search
                ? `Results for "${search}"`
                : 'All Products'}

            <span className="text-slate-400 font-normal text-sm ml-2">
              ({filtered.length})
            </span>

          </h1>

          {/* Sort — order and labels match Amazon's "Sort by" dropdown:
              Featured, then the two price directions, then rating and
              newest, with the label sitting outside the control instead
              of being baked into the first option's text. */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-slate-500 shrink-0">
              Sort by:
            </span>

            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="input w-auto"
            >
              <option value="">
                Featured
              </option>

              <option value="price_asc">
                Price: Low to High
              </option>

              <option value="price_desc">
                Price: High to Low
              </option>

              <option value="rating">
                Avg. Customer Review
              </option>

              <option value="newest">
                Newest Arrivals
              </option>

            </select>
          </div>

        </div>

        {/* Visual search notice — the camera-scan button in the header
            doesn't do image recognition against the WordPress catalog (no
            such API exists yet), so it's honest about showing the full
            catalog instead of faking a match. */}
        {visualSearch && (
          <div className="mb-4 flex items-center justify-between gap-3 bg-brand-50 text-brand-700 text-sm rounded-md px-3 py-2">
            <span>📷 Visual search is in preview — showing the full catalog for now. Try text search for exact matches.</span>
            <button
              type="button"
              onClick={() => setParam('visualSearch', '')}
              className="text-brand-700 hover:text-brand-900 font-medium shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (

          <p className="text-slate-500 text-sm">
            Loading products…
          </p>

        ) : error ? (

          /* Error */
          <div className="text-center py-10">

            <p className="text-slate-500 text-sm">
              {error}
            </p>

            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="btn-outline mt-3"
            >
              Retry
            </button>

          </div>

        ) : filtered.length === 0 ? (

          /* No Products */
          <p className="text-slate-500 text-sm">
            No products match your filters.
          </p>

        ) : (

          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">

            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}

          </div>

        )}

      </div>

    </div>
    </div>
  )
}

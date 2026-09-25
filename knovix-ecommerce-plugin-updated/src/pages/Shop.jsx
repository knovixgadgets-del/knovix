import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { CategoryIcon } from '../components/Icons'
import { getCategories, getProducts } from '../api/products'
import { rankProductsByPhoto } from '../utils/visualSearch'

// Skeleton grid shown while products are loading — mirrors the real
// product-card grid (image + title + price blocks) so the page doesn't
// jump/reflow once results arrive, on mobile or desktop.
function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-card p-3 pt-3.5">
          <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-3.5 rounded bg-slate-100 animate-pulse mt-3 w-full" />
          <div className="h-3.5 rounded bg-slate-100 animate-pulse mt-1.5 w-2/3" />
          <div className="h-5 rounded bg-slate-100 animate-pulse mt-2.5 w-1/2" />
          <div className="h-3 rounded bg-slate-100 animate-pulse mt-2 w-1/3" />
        </div>
      ))}
    </div>
  )
}

// Same broken-image fallback pattern used on the homepage's category grid —
// swaps in the category icon the moment the thumbnail errors out instead of
// showing the browser's default broken-image glyph.
function CategoryTile({ id, image, name }) {
  const [errored, setErrored] = useState(false)
  const showFallback = !image || errored

  return (
    <Link to={`/shop?category=${id}`} className="block text-center group w-full min-w-0">
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
      <p className="text-xs mt-1.5 font-medium truncate w-full">{name}</p>
    </Link>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  // URL parameters
  const category = params.get('category') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || ''
  const visualSearch = params.get('visualSearch') === '1'

  // The captured/uploaded photo travels via router state from the header's
  // camera button (see Header.jsx). A direct visit to ?visualSearch=1 with
  // no photo (e.g. a refresh) just falls back to the full catalog below.
  const visualPhoto = location.state?.visualSearchPhoto || null
  const [visualRanked, setVisualRanked] = useState(null)
  const [visualLoading, setVisualLoading] = useState(false)

  useEffect(() => {
    if (!visualSearch || !visualPhoto || products.length === 0) {
      setVisualRanked(null)
      return
    }

    let cancelled = false
    setVisualLoading(true)

    rankProductsByPhoto(visualPhoto, products)
      .then((ranked) => { if (!cancelled) setVisualRanked(ranked) })
      .catch(() => { if (!cancelled) setVisualRanked(null) })
      .finally(() => { if (!cancelled) setVisualLoading(false) })

    return () => { cancelled = true }
  }, [visualSearch, visualPhoto, products])

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

  const filtered = visualSearch && visualRanked ? visualRanked : products

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

    <div className="container-px max-w-7xl mx-auto py-4 md:py-8 grid md:grid-cols-[220px_1fr] gap-4 md:gap-8">

      {/* Sidebar */}
      <aside className="space-y-6">

        {/* Category (desktop — mobile browses via the header's category
            picker and Deals / New Arrivals / Brands links instead) */}
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

        {/* Visual search notice — there's no product-recognition API behind
            this catalog, so rather than faking an exact match, the camera
            button ranks products by real pixel-color similarity to the
            photo (see src/utils/visualSearch.js) and says so honestly. */}
        {visualSearch && (
          <div className="mb-4 flex items-center gap-3 bg-brand-50 text-brand-700 text-sm rounded-md px-3 py-2.5">
            {visualPhoto && (
              <img
                src={visualPhoto}
                alt="Your search photo"
                className="w-10 h-10 rounded-md object-cover border border-brand-200 shrink-0"
              />
            )}
            <span className="flex-1">
              {!visualPhoto
                ? '📷 Tap the camera icon in the search bar to try visual search.'
                : visualLoading
                  ? '📷 Matching your photo against the catalog…'
                  : '📷 Showing products visually closest to your photo, best match first.'}
            </span>
            <button
              type="button"
              onClick={() => setParam('visualSearch', '')}
              className="text-brand-700 hover:text-brand-900 font-medium shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading — skeleton cards matching the real grid, so the layout
            doesn't jump/flash once results arrive (this was the loading
            glitch on mobile: a one-line text swap that caused a visible
            reflow against the fixed-height cards that replaced it). */}
        {loading ? (

          <ProductGridSkeleton />

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

          /* No Products — instead of a dead end, let the shopper keep
             browsing by category rather than just reporting the miss. */
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">
              No products found{search ? ` for "${search}"` : ''}.
            </p>

            {categories.length > 0 && (
              <div className="mt-6 text-left">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">
                  Browse by category instead
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {categories.map((c) => (
                    <CategoryTile key={c.id} id={c.id} image={c.image} name={c.name} />
                  ))}
                </div>
              </div>
            )}
          </div>

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

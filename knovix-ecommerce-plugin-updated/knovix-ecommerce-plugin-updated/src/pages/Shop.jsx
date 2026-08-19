import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../api/products'

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
    <div className="container-px max-w-7xl mx-auto py-8 grid md:grid-cols-[220px_1fr] gap-8">

      {/* Sidebar */}
      <aside className="space-y-6">

        {/* Category */}
        <div>
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

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input w-auto"
          >
            <option value="">
              Sort: Featured
            </option>

            <option value="newest">
              Newest First
            </option>

            <option value="price_asc">
              Price: Low to High
            </option>

            <option value="price_desc">
              Price: High to Low
            </option>

            <option value="rating">
              Top Rated
            </option>

          </select>

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

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
  )
}
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../api/products'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const category = params.get('category') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || ''
  const [maxPrice, setMaxPrice] = useState(5000)

<<<<<<< HEAD
=======
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  useEffect(() => { getCategories().then(setCategories).catch(() => setCategories([])) }, [])

  useEffect(() => {
    setLoading(true)
<<<<<<< HEAD
    getProducts({ category, search, sort })
      .then((items) => {
        setProducts(items)
        setLoading(false)
      })
      .catch(() => {
        setProducts([])
        setLoading(false)
      })
  }, [category, search, sort])
=======
    setError('')
    getProducts({ category, search, sort })
      .then((items) => setProducts(items))
      .catch(() => setError("Couldn't load products right now. Please try again."))
      .finally(() => setLoading(false))
  }, [category, search, sort, retryKey])
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3

  const filtered = useMemo(() => products.filter((p) => p.price <= maxPrice), [products, maxPrice])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="container-px max-w-7xl mx-auto py-8 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2 text-sm">Category</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <button onClick={() => setParam('category', '')} className={!category ? 'text-brand-700 font-medium' : 'text-slate-600'}>
                All Products
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button onClick={() => setParam('category', c.id)} className={category === c.id ? 'text-brand-700 font-medium' : 'text-slate-600'}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-sm">Max Price: ₹{maxPrice}</h3>
          <input type="range" min="300" max="5000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" />
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold">
            {category ? categories.find((c) => c.id === category)?.name : search ? `Results for "${search}"` : 'All Products'}
            <span className="text-slate-400 font-normal text-sm ml-2">({filtered.length})</span>
          </h1>
          <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input w-auto">
            <option value="">Sort: Featured</option>
<<<<<<< HEAD
=======
            <option value="newest">Newest First</option>
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading products…</p>
<<<<<<< HEAD
=======
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">{error}</p>
            <button onClick={() => setRetryKey((k) => k + 1)} className="btn-outline mt-3">Retry</button>
          </div>
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-sm">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

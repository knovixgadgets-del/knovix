import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProduct } from '../api/products'
import { useWishlist } from '../context/WishlistContext'
import usePageMeta from '../utils/usePageMeta'

// Load each saved product by id instead of downloading the whole catalogue and
// filtering. The old approach silently dropped wishlist items that weren't on the
// first page of results the API returned.
export default function Wishlist() {
  const { ids } = useWishlist()
  const [products, setProducts] = useState({}) // id -> product (null = no longer sold)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  usePageMeta('My Wishlist', undefined, { noindex: true })

  useEffect(() => {
    const missing = ids.filter((id) => !(id in products))
    if (missing.length === 0) {
      setLoading(false)
      return
    }

    let alive = true
    setLoading(true)
    setFailed(false)

    Promise.allSettled(missing.map((id) => getProduct(id).then((p) => [id, p && p.id ? p : null])))
      .then((results) => {
        if (!alive) return
        const next = {}
        let anyFailed = false
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') next[r.value[0]] = r.value[1]
          else if (r.reason?.status === 404) next[missing[i]] = null // removed from the store
          else anyFailed = true
        })
        setProducts((prev) => ({ ...prev, ...next }))
        setFailed(anyFailed)
      })
      .finally(() => { if (alive) setLoading(false) })

    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, retryKey])

  const items = ids.map((id) => products[id]).filter(Boolean)

  if (ids.length === 0) {
    return (
      <div className="container-px max-w-3xl mx-auto py-20 text-center">
        <p className="text-5xl mb-4" aria-hidden="true">♡</p>
        <h1 className="text-xl font-bold">Your wishlist is empty</h1>
        <p className="text-slate-500 text-sm mt-2">Tap the heart on any product to save it here.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    )
  }

  if (loading && items.length === 0) {
    return <div className="container-px max-w-3xl mx-auto py-20 text-center text-slate-500 text-sm" role="status">Loading your wishlist…</div>
  }

  if (failed && items.length === 0) {
    return (
      <div className="container-px max-w-3xl mx-auto py-20 text-center">
        <p className="text-slate-600 text-sm">Couldn't load your wishlist right now.</p>
        <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="btn-primary mt-4 inline-flex">Retry</button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-px max-w-3xl mx-auto py-20 text-center">
        <p className="text-slate-600 text-sm">The products you saved are no longer available.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="container-px max-w-7xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">My Wishlist ({items.length})</h1>
      {failed && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded-md px-3 py-2 mb-4">
          Some items couldn't be loaded.{' '}
          <button type="button" className="underline font-medium" onClick={() => setRetryKey((k) => k + 1)}>Retry</button>
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

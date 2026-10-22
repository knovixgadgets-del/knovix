import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api/products'
import { useWishlist } from '../context/WishlistContext'

export default function Wishlist() {
  const { ids } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(false)
    getProducts()
      .then((items) => { if (alive) setProducts(items) })
      .catch(() => { if (alive) setError(true) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [retryKey])

  const items = products.filter((p) => ids.map(String).includes(String(p.id)))

  if (loading && ids.length > 0) {
    return <div className="container-px max-w-3xl mx-auto py-20 text-center text-slate-500 text-sm">Loading your wishlist…</div>
  }

  if (error && ids.length > 0) {
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
        <p className="text-5xl mb-4">♡</p>
        <h1 className="text-xl font-bold">Your wishlist is empty</h1>
        <p className="text-slate-500 text-sm mt-2">Tap the heart on any product to save it here.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="container-px max-w-7xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-4">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

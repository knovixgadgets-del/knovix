import { useEffect, useState } from 'react'
<<<<<<< HEAD
import { Link, useParams, useNavigate } from 'react-router-dom'
=======
import { Link, useNavigate, useParams } from 'react-router-dom'
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
import StarRating from '../components/StarRating'
import { getProduct, getProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

<<<<<<< HEAD
export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const navigate = useNavigate()

  const handleBuyNow = () => {
    addItem(product, qty)
    navigate('/checkout')
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/product/${product.id}`
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }
=======
const RECENTLY_VIEWED_KEY = 'knovix_recently_viewed'

function pushRecentlyViewed(product) {
  try {
    const prev = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || []
    const entry = { id: product.id, name: product.name, price: product.price, image: product.image }
    const next = [entry, ...prev.filter((p) => p.id !== product.id)].slice(0, 8)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable — recently viewed is a nice-to-have, safe to skip
  }
}

function readRecentlyViewed(excludeId) {
  try {
    const prev = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || []
    return prev.filter((p) => p.id !== excludeId)
  } catch {
    return []
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3

  useEffect(() => {
    setProduct(null)
    setAdded(false)
    setNotFound(false)
<<<<<<< HEAD
    getProduct(id)
      .then((p) => {
        setProduct(p)
        if (!p) { setNotFound(true); return }
=======
    setError(false)
    setQty(1)
    getProduct(id)
      .then((p) => {
        if (!p) {
          setNotFound(true)
          return
        }
        setProduct(p)
        pushRecentlyViewed(p)
        setRecentlyViewed(readRecentlyViewed(p.id))
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
        getProducts({ category: p.category })
          .then((items) => setRelated(items.filter((i) => i.id !== p.id).slice(0, 4)))
          .catch(() => setRelated([]))
      })
<<<<<<< HEAD
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="container-px max-w-7xl mx-auto py-16 text-center text-slate-500">
        We couldn't load this product. Please try again in a moment.
      </div>
    )
  }

=======
      .catch(() => setError(true))
  }, [id])

  if (error) {
    return (
      <div className="container-px max-w-7xl mx-auto py-16 text-center text-slate-500">
        Couldn't load this product right now. Please try again.
      </div>
    )
  }
  if (notFound) {
    return (
      <div className="container-px max-w-7xl mx-auto py-16 text-center text-slate-500">
        Product not found. <Link to="/shop" className="underline text-brand-700">Back to shop</Link>
      </div>
    )
  }
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  if (!product) return <div className="container-px max-w-7xl mx-auto py-16 text-center text-slate-500">Loading product…</div>

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100)

<<<<<<< HEAD
=======
  function handleBuyNow() {
    addItem(product, qty)
    navigate('/checkout')
  }

>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  return (
    <div className="container-px max-w-7xl mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="mt-2"><StarRating rating={product.rating} reviews={product.reviews} /></div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold">₹{product.price}</span>
            <span className="text-slate-400 line-through">₹{product.mrp}</span>
            {off > 0 && <span className="badge-off">{off}% OFF</span>}
          </div>

          <p className="mt-4 text-slate-600 text-sm leading-relaxed">{product.description}</p>

          <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? 'text-brand-700' : 'text-red-500'}`}>
<<<<<<< HEAD
            {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
              <span className="px-4">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">+</button>
            </div>
            <button
              onClick={() => { addItem(product, qty); setAdded(true) }}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              {added ? 'Added ✓' : 'Add to Cart'}
            </button>
=======
            {product.stock === 0
              ? 'Out of stock'
              : product.stock <= 10
                ? `⚡ Only ${product.stock} left in stock — order soon`
                : `In stock (${product.stock} available)`}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center border rounded-md">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
              <span className="px-4">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                className="px-3 py-2 disabled:opacity-30"
              >
                +
              </button>
            </div>
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
            <button onClick={() => toggle(product.id)} className="btn-outline">
              {isWishlisted(product.id) ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

<<<<<<< HEAD
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-dark flex-1"
            >
              Buy Now
            </button>
            <button onClick={handleCopyLink} className="btn-outline whitespace-nowrap">
              {linkCopied ? 'Link copied ✓' : '🔗 Copy link'}
=======
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { addItem(product, qty); setAdded(true) }}
              disabled={product.stock === 0}
              className="btn-outline flex-1"
            >
              {added ? 'Added ✓' : '🛒 Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              ⚡ Buy Now
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
            </button>
          </div>

          {added && (
            <div className="mt-3 text-sm bg-brand-50 text-brand-700 rounded-md px-3 py-2">
              Added to cart. <Link to="/cart" className="underline font-medium">View cart</Link>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="card p-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-50">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm mt-2 line-clamp-2">{p.name}</p>
                <p className="font-semibold text-sm mt-1">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
<<<<<<< HEAD
=======

      {recentlyViewed.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyViewed.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="card p-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-50">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm mt-2 line-clamp-2">{p.name}</p>
                <p className="font-semibold text-sm mt-1">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
    </div>
  )
}

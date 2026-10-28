import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'
import { getProduct, getProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useShippingRules } from '../utils/shipping'
import { getDisplayRating, hasRating } from '../utils/rating'
import { discountPercent, inr, stockInfo, stripHtml } from '../utils/format'
import usePageMeta from '../utils/usePageMeta'
import { TruckIcon, CheckCircleIcon, BoxIcon } from '../components/Icons'

const RECENTLY_VIEWED_KEY = 'knovix_recently_viewed'

function readRecentlyViewedRaw() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function pushRecentlyViewed(product) {
  try {
    const entry = { id: product.id, name: product.name, price: product.price, image: product.image }
    const next = [entry, ...readRecentlyViewedRaw().filter((p) => String(p.id) !== String(product.id))].slice(0, 8)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable
  }
}

function readRecentlyViewed(excludeId) {
  return readRecentlyViewedRaw().filter((p) => p && String(p.id) !== String(excludeId))
}

function DetailSkeleton() {
  return (
    <div className="container-px max-w-7xl mx-auto py-8" aria-busy="true" aria-label="Loading product">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
        <div className="space-y-4">
          <div className="h-7 rounded bg-slate-100 animate-pulse w-4/5" />
          <div className="h-4 rounded bg-slate-100 animate-pulse w-1/3" />
          <div className="h-9 rounded bg-slate-100 animate-pulse w-1/2" />
          <div className="h-24 rounded bg-slate-100 animate-pulse" />
          <div className="h-11 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
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
  const [retryKey, setRetryKey] = useState(0)
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const { addItem, updateQty, items: cartItems } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { freeMin } = useShippingRules()

  const inCart = product ? cartItems.some((i) => i.id === product.id) : false

  const description = stripHtml(product?.description)
  usePageMeta(product?.name, description ? description.replace(/\s+/g, ' ').slice(0, 155) : undefined)

  useEffect(() => {
    let alive = true

    setProduct(null)
    setRelated([])
    setRecentlyViewed([])
    setAdded(false)
    setNotFound(false)
    setError(false)
    setLinkCopied(false)
    setQty(1)
    setActiveImage(0)

    getProduct(id)
      .then((p) => {
        if (!alive) return
        if (!p || !p.id) {
          setNotFound(true)
          return
        }

        setProduct(p)
        pushRecentlyViewed(p)
        setRecentlyViewed(readRecentlyViewed(p.id))

        getProducts({ category: p.category })
          .then((items) => {
            if (alive) setRelated(items.filter((i) => String(i.id) !== String(p.id)).slice(0, 4))
          })
          .catch(() => { if (alive) setRelated([]) })
      })
      .catch((err) => {
        if (!alive) return
        // A missing product is a 404 from the API, not a connection problem.
        if (err?.status === 404) setNotFound(true)
        else setError(true)
      })

    return () => { alive = false }
  }, [id, retryKey])

  if (error) {
    return (
      <div className="container-px max-w-7xl mx-auto py-16 text-center">
        <p className="text-slate-600 text-sm">Couldn't load this product right now. Please try again.</p>
        <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="btn-primary mt-4 inline-flex">Retry</button>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container-px max-w-7xl mx-auto py-16 text-center">
        <p className="text-slate-600 text-sm">We couldn't find that product. It may have been removed.</p>
        <Link to="/shop" className="btn-primary mt-4 inline-flex">Back to shop</Link>
      </div>
    )
  }

  if (!product) return <DetailSkeleton />

  const price = Number(product.price) || 0
  const mrp = Number(product.mrp) || 0
  const off = discountPercent(mrp, price)
  const stock = stockInfo(product)
  const maxQty = stock.known ? Math.max(1, stock.qty) : 10
  const wished = isWishlisted(product.id)

  const gallery = (Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image]).filter(Boolean)
  const mainImage = gallery[activeImage] || gallery[0]

  function handleAddToCart() {
    if (stock.out) return
    addItem(product, qty)
    setAdded(true)
  }

  function handleBuyNow() {
    if (stock.out) return
    // "Buy now" buys the quantity chosen here, not "chosen + whatever was already in the cart".
    if (inCart) updateQty(product.id, qty)
    else addItem(product, qty)
    navigate('/checkout')
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/product/${product.id}`
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  const recent = recentlyViewed.slice(0, 4)

  return (
    <div className="container-px max-w-7xl mx-auto py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-4 flex flex-wrap items-center gap-1.5">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span aria-hidden="true">›</span>
        <Link to="/shop" className="hover:text-brand-700">Shop</Link>
        <span aria-hidden="true">›</span>
        <span className="text-slate-700 line-clamp-1" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-slate-300 text-sm">No image available</span>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1} of ${gallery.length}`}
                  aria-current={i === activeImage}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-white ${
                    i === activeImage ? 'border-brand-600' : 'border-slate-200'
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold leading-snug">{product.name}</h1>

          {hasRating(product) && (
            <div className="mt-2">
              <StarRating
                rating={getDisplayRating(product)}
                reviews={Number(product.reviews) > 0 ? product.reviews : undefined}
                size="text-sm"
              />
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
              {off > 0 && <span className="text-2xl text-red-600 font-light">-{off}%</span>}
              <span className="text-3xl font-bold text-ink-900">₹{inr(price)}</span>
            </div>
            {mrp > price && (
              <p className="text-sm text-slate-500 mt-1">
                M.R.P.: <span className="line-through">₹{inr(mrp)}</span>
                <span className="text-emerald-600 font-medium ml-2">You save ₹{inr(mrp - price)}</span>
              </p>
            )}
          </div>

          <p
            className={`mt-4 text-base font-semibold ${stock.out ? 'text-red-600' : stock.low ? 'text-amber-700' : 'text-emerald-700'}`}
          >
            {stock.out
              ? 'Currently unavailable'
              : stock.low
                ? `Only ${stock.qty} left in stock — order soon`
                : 'In stock'}
          </p>

          {!stock.out && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-600">Quantity</span>
              <div className="flex items-center border border-slate-300 rounded-md bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="px-3 py-2 disabled:opacity-30"
                >
                  −
                </button>
                <span className="px-4 min-w-[2.5rem] text-center text-sm font-medium" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Increase quantity"
                  className="px-3 py-2 disabled:opacity-30"
                >
                  +
                </button>
              </div>
              {stock.known && qty >= maxQty && <span className="text-xs text-slate-500">Maximum available</span>}
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            {inCart && !stock.out ? (
              <Link to="/cart" className="btn-outline flex-1 h-11 text-sm whitespace-nowrap">
                Go to Cart
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock.out}
                className="add-to-cart-btn flex-1 !h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            )}

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock.out}
              className="btn-primary flex-1 h-11 text-sm whitespace-nowrap"
            >
              Buy Now
            </button>
          </div>

          {added && (
            <div role="status" className="mt-3 text-sm bg-emerald-50 text-emerald-800 rounded-md px-3 py-2">
              Added to cart.{' '}
              <Link to="/cart" className="underline font-semibold">View cart</Link>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-pressed={wished}
              className="btn-ghost border border-slate-200 h-9 px-3 text-xs"
            >
              {wished ? '♥ In wishlist' : '♡ Add to wishlist'}
            </button>
            <button type="button" onClick={handleCopyLink} className="btn-ghost border border-slate-200 h-9 px-3 text-xs">
              {linkCopied ? 'Link copied ✓' : 'Copy link'}
            </button>
          </div>

          {/* Delivery & trust — same promises already made on the home page */}
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-3 text-xs text-slate-600">
            <li className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
              <TruckIcon className="w-5 h-5 text-brand-700 shrink-0" />
              <span>
                <span className="block font-semibold text-ink-900">Delivery</span>
                {freeMin ? `Free above ₹${inr(freeMin)}` : 'Shipping calculated at checkout'}
              </span>
            </li>
            <li className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
              <BoxIcon className="w-5 h-5 text-brand-700 shrink-0" />
              <span>
                <span className="block font-semibold text-ink-900">Easy replacement</span>
                <Link to="/returns" className="hover:underline">7-day policy</Link>
              </span>
            </li>
            <li className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
              <CheckCircleIcon className="w-5 h-5 text-brand-700 shrink-0" />
              <span>
                <span className="block font-semibold text-ink-900">Secure checkout</span>
                Safe &amp; protected
              </span>
            </li>
          </ul>

          {description && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h2 className="text-base font-bold mb-2">About this item</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-14" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="text-lg font-bold mb-4">Recently viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recent.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="card p-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-300">No image</span>
                  )}
                </div>
                <p className="text-sm mt-2 line-clamp-2">{p.name}</p>
                <p className="font-semibold text-sm mt-1">₹{inr(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

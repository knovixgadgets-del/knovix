import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import StarRating from './StarRating'
import { getDisplayRating, hasRating } from '../utils/rating'
import { inr, stockInfo, discountPercent } from '../utils/format'

// "68% OFF" badge. Flat brand colour (the old gradient used a hard-coded SVG id,
// which was duplicated once per card on the page).
function DiscountBadge({ percent }) {
  return (
    <div
      className="absolute -top-2 -left-2 z-10 w-12 h-12 rounded-full bg-brand-600 text-white shadow-sm ring-2 ring-white flex flex-col items-center justify-center font-bold leading-[1.05] text-[10px] select-none pointer-events-none"
      aria-label={`${percent} percent off`}
    >
      <span>{percent}%</span>
      <span>OFF</span>
    </div>
  )
}

export default function ProductCard({ product }) {
  const { toggle, isWishlisted } = useWishlist()
  const { addItem, items } = useCart()
  const inCart = items.some((i) => i.id === product.id)
  const [imgErrored, setImgErrored] = useState(false)

  const price = Number(product.price) || 0
  const mrp = Number(product.mrp) || 0
  const percent = discountPercent(mrp, price)
  const saved = mrp > price ? mrp - price : 0
  const stock = stockInfo(product)
  const wished = isWishlisted(product.id)

  return (
    <div className="relative group product-card">
      {percent > 0 && <DiscountBadge percent={percent} />}

      <Link
        to={`/product/${product.id}`}
        className="block h-full bg-white rounded-2xl shadow-card p-3 pt-3.5 flex flex-col pb-14"
      >
        <div className="aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
          {product.image && !imgErrored ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                stock.out ? 'opacity-50' : ''
              }`}
              loading="lazy"
              onError={() => setImgErrored(true)}
            />
          ) : (
            <span className="text-slate-300 text-xs">No image</span>
          )}
        </div>

        <h3 className="mt-3 text-[15px] leading-snug font-medium text-ink-900 line-clamp-2 min-h-[2.6em] font-body">
          {product.name}
        </h3>

        {hasRating(product) && (
          <div className="mt-1">
            <StarRating rating={getDisplayRating(product)} reviews={Number(product.reviews) > 0 ? product.reviews : undefined} />
          </div>
        )}

        <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold text-ink-900">₹{inr(price)}</span>
          {saved > 0 && <span className="text-sm text-slate-400 line-through">₹{inr(mrp)}</span>}
        </div>

        {saved > 0 && (
          <p className="mt-1 text-[15px] font-medium text-emerald-600">You save ₹{inr(saved)}</p>
        )}

        {stock.out ? (
          <p className="text-xs text-red-500 font-medium mt-1">Out of stock</p>
        ) : (
          stock.low && <p className="text-xs text-red-500 font-medium mt-1">Only {stock.qty} left</p>
        )}
      </Link>

      {!stock.out && (
        inCart ? (
          <Link to="/cart" className="add-to-cart-btn absolute left-3 right-3 bottom-3 flex items-center justify-center">
            Go to Cart
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => addItem(product, 1)}
            className="add-to-cart-btn absolute left-3 right-3 bottom-3"
          >
            Add to Cart
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wished}
        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
      >
        <span className={wished ? 'text-red-500' : 'text-slate-400'}>{wished ? '♥' : '♡'}</span>
      </button>
    </div>
  )
}

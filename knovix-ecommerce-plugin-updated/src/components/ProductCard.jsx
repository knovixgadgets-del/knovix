import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

const inr = (n) => Number(n || 0).toLocaleString('en-IN')

// Scalloped "68% OFF" badge (orange-red starburst with rounded points),
// drawn as one SVG path so it stays crisp at any density.
function scallopPath(cx, cy, r, bumps = 10, depth = 0.09, steps = 120) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const rr = r * (1 - depth + depth * Math.cos(bumps * t))
    pts.push(`${(cx + rr * Math.cos(t)).toFixed(2)},${(cy + rr * Math.sin(t)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}
const BADGE_PATH = scallopPath(24, 24, 24)

function DiscountBadge({ percent }) {
  return (
    <div className="absolute -top-2 -left-2 z-10 w-12 h-12 select-none pointer-events-none">
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full drop-shadow-sm" aria-hidden="true">
        <defs>
          <linearGradient id="off-badge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff7a3d" />
            <stop offset="1" stopColor="#f0481f" />
          </linearGradient>
        </defs>
        <path d={BADGE_PATH} fill="url(#off-badge-grad)" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold leading-[1.05] text-[10px]">
        <span>{percent}%</span>
        <span>OFF</span>
      </span>
    </div>
  )
}

export default function ProductCard({ product }) {
  const { toggle, isWishlisted } = useWishlist()
  const [imgErrored, setImgErrored] = useState(false)

  const mrp = Number(product.mrp) || 0
  const price = Number(product.price) || 0
  const percent = useMemo(
    () => (mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0),
    [mrp, price]
  )
  const saved = mrp > price ? mrp - price : 0
  const outOfStock = product.stock === 0
  const wished = isWishlisted(product.id)

  return (
    <div className="relative group">
      {percent > 0 && <DiscountBadge percent={percent} />}

      <Link
        to={`/product/${product.id}`}
        className="block h-full bg-white rounded-2xl shadow-card p-3 pt-3.5 flex flex-col"
      >
        <div className="aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
          {product.image && !imgErrored ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                outOfStock ? 'opacity-50' : ''
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

        <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold text-ink-900">₹{inr(price)}</span>
          {saved > 0 && (
            <span className="text-sm text-slate-400 line-through">₹{inr(mrp)}</span>
          )}
        </div>

        {saved > 0 && (
          <p className="mt-1 text-[15px] font-medium text-emerald-600">You save ₹{inr(saved)}</p>
        )}

        {outOfStock ? (
          <p className="text-xs text-red-500 font-medium mt-1">Out of stock</p>
        ) : (
          product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-red-500 font-medium mt-1">Only {product.stock} left</p>
          )
        )}
      </Link>

      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-label="Toggle wishlist"
        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
      >
        <span className={wished ? 'text-red-500' : 'text-slate-400'}>{wished ? '♥' : '♡'}</span>
      </button>
    </div>
  )
}

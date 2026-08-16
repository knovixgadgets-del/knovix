import { Link, useNavigate } from 'react-router-dom'
import StarRating from './StarRating'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const navigate = useNavigate()
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100)

  function handleBuyNow(e) {
    e.preventDefault()
    addItem(product, 1)
    navigate('/checkout')
  }

  return (
    <div className="card p-3 flex flex-col group">
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block aspect-square rounded-lg overflow-hidden bg-slate-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        <button
          onClick={() => toggle(product.id)}
          aria-label="Toggle wishlist"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
        >
          <span className={isWishlisted(product.id) ? 'text-red-500' : 'text-slate-400'}>
            {isWishlisted(product.id) ? '♥' : '♡'}
          </span>
        </button>
      </div>

      <StarRating rating={product.rating} reviews={product.reviews} />

      <Link to={`/product/${product.id}`} className="mt-1 text-sm font-medium leading-snug line-clamp-2 hover:text-brand-700">
        {product.name}
      </Link>

      <div className="mt-1 flex items-center gap-2">
        <span className="text-slate-400 text-xs line-through">₹{product.mrp}</span>
        <span className="font-semibold">₹{product.price}</span>
        {off > 0 && <span className="badge-off">{off}% OFF</span>}
      </div>

      {product.stock > 0 && product.stock <= 10 && (
        <p className="text-[11px] text-red-500 font-medium mt-1">Only {product.stock} left</p>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => addItem(product, 1)}
          disabled={product.stock === 0}
          className="btn-outline flex-1 text-xs py-2"
        >
          🛒 {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="btn-primary flex-1 text-xs py-2"
        >
          ⚡ Buy Now
        </button>
      </div>
    </div>
  )
}

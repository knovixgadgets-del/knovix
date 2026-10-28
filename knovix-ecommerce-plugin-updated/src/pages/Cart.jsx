import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useShippingRules } from '../utils/shipping'
import { inr } from '../utils/format'
import usePageMeta from '../utils/usePageMeta'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, savings, count } = useCart()
  const { freeMin } = useShippingRules()
  usePageMeta('Shopping Cart', undefined, { noindex: true })

  if (items.length === 0) {
    return (
      <div className="container-px max-w-3xl mx-auto py-20 text-center">
        <p className="text-5xl mb-4" aria-hidden="true">🛒</p>
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-slate-500 text-sm mt-2">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Start Shopping</Link>
      </div>
    )
  }

  const toFree = freeMin ? Math.max(0, Math.ceil(freeMin - subtotal)) : 0

  return (
    <div className="bg-brand-50 min-h-[60vh]">
      <div className="container-px max-w-6xl mx-auto py-6 sm:py-8 grid md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px] gap-5 lg:gap-6 items-start">
        <section aria-labelledby="cart-heading" className="card p-4 sm:p-6">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
            <h1 id="cart-heading" className="text-xl font-bold">Shopping Cart</h1>
            <span className="text-xs text-slate-500">Price</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {items.map((i) => {
              const lineTotal = i.price * i.qty
              const atMax = i.stock !== null && i.stock !== undefined && i.qty >= i.stock
              return (
                <li key={i.id} className="py-4 flex gap-3 sm:gap-4">
                  <Link to={`/product/${i.id}`} className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                    {i.image ? (
                      <img src={i.image} alt={i.name} loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-300">No image</span>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <Link to={`/product/${i.id}`} className="text-sm sm:text-base font-medium text-ink-900 hover:text-brand-700 line-clamp-2">
                        {i.name}
                      </Link>
                      <p className="font-bold text-ink-900 shrink-0">₹{inr(lineTotal)}</p>
                    </div>

                    <p className="text-xs text-emerald-700 mt-1">In stock</p>
                    {i.mrp > i.price && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="line-through">₹{inr(i.mrp)}</span> each · ₹{inr(i.price)} now
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center border border-slate-300 rounded-full bg-slate-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQty(i.id, i.qty - 1)}
                          aria-label={i.qty === 1 ? `Remove ${i.name} from cart` : `Decrease quantity of ${i.name}`}
                          className="w-9 h-8 text-lg leading-none hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm font-semibold min-w-[2rem] text-center" aria-live="polite">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(i.id, i.qty + 1)}
                          disabled={atMax}
                          aria-label={`Increase quantity of ${i.name}`}
                          className="w-9 h-8 text-lg leading-none hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(i.id)}
                        className="text-xs text-brand-700 hover:underline"
                      >
                        Delete
                      </button>
                      {atMax && <span className="text-xs text-slate-500">Max available</span>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="border-t border-slate-100 pt-3 text-right text-base">
            Subtotal ({count} item{count === 1 ? '' : 's'}): <span className="font-bold">₹{inr(subtotal)}</span>
          </div>
        </section>

        <aside className="card p-5 md:sticky md:top-28" aria-label="Order summary">
          {freeMin && (
            toFree > 0 ? (
              <p className="text-xs text-brand-800 bg-brand-50 rounded-md px-3 py-2 mb-4">
                Add <strong>₹{inr(toFree)}</strong> more to get <strong>free delivery</strong>.
              </p>
            ) : (
              <p className="text-xs text-emerald-800 bg-emerald-50 rounded-md px-3 py-2 mb-4">
                ✓ Your order qualifies for <strong>free delivery</strong>.
              </p>
            )
          )}

          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Items ({count})</span><span>₹{inr(subtotal)}</span></div>
            {savings > 0 && (
              <div className="flex justify-between text-emerald-700"><span>You save</span><span>₹{inr(savings)}</span></div>
            )}
            <div className="flex justify-between"><span>Shipping</span><span className="text-slate-500">Calculated at checkout</span></div>
            <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2"><span>Subtotal</span><span>₹{inr(subtotal)}</span></div>
          </div>

          <Link to="/checkout" className="btn-primary w-full mt-4 h-11">Proceed to Checkout</Link>
          <Link to="/shop" className="btn-outline w-full mt-2 h-10">Continue shopping</Link>
          <p className="text-[11px] text-slate-500 text-center mt-3">🔒 Secure checkout · 7-day easy replacement</p>
        </aside>
      </div>
    </div>
  )
}

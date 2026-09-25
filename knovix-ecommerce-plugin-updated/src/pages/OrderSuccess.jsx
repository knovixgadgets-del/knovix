import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders'
import { CheckCircleIcon, TruckIcon } from '../components/Icons'

const inr = (n) => Number(n || 0).toLocaleString('en-IN')

const paymentLabel = {
  cod: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Credit / Debit Card'
}

// Amazon shows a delivery-date estimate rather than a bare confirmation —
// a simple, honest window (no live courier data behind this catalog) based
// off when the order was placed.
function estimatedDelivery(createdAt) {
  const base = createdAt ? new Date(createdAt) : new Date()
  const from = new Date(base)
  from.setDate(from.getDate() + 3)
  const to = new Date(base)
  to.setDate(to.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${fmt(from)} – ${fmt(to)}`
}

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOrder(id)
      .then((o) => { if (!cancelled) setOrder(o) })
      .catch(() => { if (!cancelled) setOrder(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  return (
    <div className="bg-[#f6f4fb] min-h-[70vh]">
      <div className="container-px max-w-3xl mx-auto py-8 sm:py-12">

        {/* Header — big confirmation banner, Amazon-style, instead of a
            plain centered checkmark and one line of text. */}
        <div className="card p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 bg-gradient-to-r from-emerald-50 to-white">
          <span className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-8 h-8" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900">Thank you! Your order is confirmed.</h1>
            <p className="text-sm text-slate-500 mt-1">
              Order <span className="font-mono font-medium text-ink-900">#{id}</span>
              {order?.createdAt && (
                <> · Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-3">
            <div className="card p-5 h-24 bg-slate-100 animate-pulse" />
            <div className="card p-5 h-40 bg-slate-100 animate-pulse" />
          </div>
        ) : !order ? (
          <div className="card p-5 mt-4 text-sm text-slate-500">
            We couldn't load the details for this order right now, but your confirmation email/SMS is on its way.
          </div>
        ) : (
          <>
            {/* Delivery estimate strip */}
            <div className="card p-4 sm:p-5 mt-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <TruckIcon className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Arriving {estimatedDelivery(order.createdAt)}</p>
                <p className="text-xs text-slate-500">We'll email/SMS you tracking details as soon as it ships.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-[1fr_280px] gap-4 mt-4">
              {/* Items */}
              <div className="card p-4 sm:p-5">
                <h2 className="font-semibold text-sm mb-3">Items in this order</h2>
                <div className="divide-y divide-slate-100">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                      <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-300">No image</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">₹{inr(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                {order.customer && (
                  <div className="border-t border-slate-100 mt-3 pt-3">
                    <h2 className="font-semibold text-sm mb-1.5">Shipping to</h2>
                    <p className="text-sm text-slate-600">
                      {order.customer.name} · {order.customer.phone}<br />
                      {order.customer.address}, {order.customer.city}, {order.customer.state} – {order.customer.pincode}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment summary */}
              <div className="card p-4 sm:p-5 h-fit">
                <h2 className="font-semibold text-sm mb-3">Order summary</h2>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹{inr(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{order.shipping === 0 ? 'Free' : `₹${inr(order.shipping)}`}</span></div>
                  <div className="flex justify-between font-semibold text-base border-t border-slate-100 pt-2 mt-1"><span>Total paid</span><span>₹{inr(order.total)}</span></div>
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  Paid via {paymentLabel[order.payment] || order.payment}
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
          <Link to="/account" className="btn-primary">View My Orders</Link>
        </div>
      </div>
    </div>
  )
}

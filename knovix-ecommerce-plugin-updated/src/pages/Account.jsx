import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrders } from '../api/orders'
import { BoxIcon, ChevronRightIcon } from '../components/Icons'
import usePageMeta from '../utils/usePageMeta'

const inr = (n) => Number(n || 0).toLocaleString('en-IN')

const statusColor = {
  placed: 'bg-amber-50 text-amber-600',
  shipped: 'bg-blue-50 text-blue-600',
  delivered: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-red-50 text-red-600'
}

// Small stack of item thumbnails (first three + "+N more"), the way
// Amazon's order-history cards preview what's inside an order without
// needing to open it.
function ItemThumbs({ items = [] }) {
  const shown = items.slice(0, 3)
  const extra = items.length - shown.length

  return (
    <div className="flex items-center -space-x-2 shrink-0">
      {shown.map((item, i) => (
        <div
          key={item.id ?? i}
          className="w-11 h-11 rounded-lg bg-slate-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center"
          style={{ zIndex: shown.length - i }}
        >
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            <BoxIcon className="w-4 h-4 text-slate-300" />
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-11 h-11 rounded-lg bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[11px] font-semibold text-slate-500">
          +{extra}
        </div>
      )}
    </div>
  )
}

export default function Account() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  usePageMeta('My Account', undefined, { noindex: true })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getOrders({ userId: user.id })
      .then((items) => { if (!cancelled) setOrders(Array.isArray(items) ? items : []) })
      .catch(() => { if (!cancelled) { setOrders([]); setError(true) } }) // don't pretend there are no orders
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user.id, retryKey])

  const formatDate = (d) => {
    const date = new Date(d)
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="container-px max-w-3xl mx-auto py-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">My Account</h1>
          <p className="text-sm text-slate-500 mt-1 truncate">
            {[user.name, user.email || user.phone].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button type="button" onClick={logout} className="btn-outline h-9 px-4 text-xs shrink-0">Sign out</button>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Order History</h2>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="card p-4 h-24 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-slate-600 text-sm">We couldn't load your orders right now.</p>
          <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="btn-primary mt-4 inline-flex">Retry</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-slate-500 text-sm">You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn-primary inline-flex mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium font-mono truncate">{o.id}</p>
                  <p className="text-xs text-slate-500">{formatDate(o.createdAt)}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-1 capitalize shrink-0 ${statusColor[o.status] || 'bg-slate-100 text-slate-600'}`}>
                  {o.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ItemThumbs items={o.items || []} />
                  <p className="text-sm text-slate-600 truncate">
                    {(o.items || []).length} item{(o.items || []).length === 1 ? '' : 's'} · <span className="font-semibold text-ink-900">₹{inr(o.total)}</span>
                  </p>
                </div>

                {/* Attractive, Amazon-style "View Order" entry point —
                    a pill button rather than the order card just sitting
                    there with no next action. */}
                <Link
                  to={`/order-success/${o.id}`}
                  className="inline-flex items-center gap-1 shrink-0 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs sm:text-sm font-semibold rounded-full pl-3 pr-2.5 py-1.5 transition-colors"
                >
                  View Order
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

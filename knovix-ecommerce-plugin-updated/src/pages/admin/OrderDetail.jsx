import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrder, updateOrderStatus } from '../../api/orders'

const statuses = ['placed', 'shipped', 'delivered', 'cancelled']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    setError(false)
    getOrder(id).then((o) => { if (alive) setOrder(o) }).catch(() => { if (alive) setError(true) })
    return () => { alive = false }
  }, [id])

  const [statusError, setStatusError] = useState('')

  async function handleStatus(status) {
    setStatusError('')
    try {
      const updated = await updateOrderStatus(id, status)
      setOrder(updated)
    } catch (err) {
      setStatusError(err.message || "Couldn't update the status.")
    }
  }


  if (error) return <p className="text-red-500 text-sm">We couldn't load this order. Please try again.</p>

  if (!order) return <p className="text-slate-500 text-sm">Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-1 font-mono">{order.id}</h1>
      <p className="text-sm text-slate-500 mb-6">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="card p-5 mb-4">
        <h2 className="font-semibold mb-2 text-sm">Customer</h2>
        <p className="text-sm">{order.customer?.name} · {order.customer?.phone}</p>
        <p className="text-sm text-slate-500">{order.customer?.address}, {order.customer?.city}, {order.customer?.state} {order.customer?.pincode}</p>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-semibold mb-2 text-sm">Items</h2>
        {(order.items || []).map((i) => (
          <div key={i.id} className="flex justify-between text-sm py-1">
            <span>{i.name} × {i.qty}</span>
            <span>₹{(Number(i.price) || 0) * (Number(i.qty) || 0)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
          <span>Total</span><span>₹{order.total}</span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3 text-sm">Update Status</h2>
        {statusError && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2 mb-3">{statusError}</p>}
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => handleStatus(s)}
              className={`text-xs font-medium rounded-full px-3 py-1.5 capitalize border ${order.status === s ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 text-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

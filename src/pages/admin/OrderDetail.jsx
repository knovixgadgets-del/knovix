import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrder, updateOrderStatus } from '../../api/orders'

const statuses = ['placed', 'shipped', 'delivered', 'cancelled']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
<<<<<<< HEAD
  const [error, setError] = useState(false)

  useEffect(() => { getOrder(id).then(setOrder).catch(() => setError(true)) }, [id])
=======

  useEffect(() => { getOrder(id).then(setOrder) }, [id])
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3

  async function handleStatus(status) {
    const updated = await updateOrderStatus(id, status)
    setOrder(updated)
  }

<<<<<<< HEAD
  if (error) return <p className="text-red-500 text-sm">We couldn't load this order. Please try again.</p>
=======
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
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
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm py-1">
            <span>{i.name} × {i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
          <span>Total</span><span>₹{order.total}</span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3 text-sm">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
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

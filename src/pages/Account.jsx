import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getOrders } from '../api/orders'

const statusColor = {
  placed: 'bg-amber-50 text-amber-600',
  shipped: 'bg-blue-50 text-blue-600',
  delivered: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-red-50 text-red-600'
}

export default function Account() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])


  useEffect(() => { getOrders({ userId: user.id }).then(setOrders).catch(() => setOrders([])) }, [user.id])

  useEffect(() => { getOrders({ userId: user.id }).then(setOrders) }, [user.id])


  return (
    <div className="container-px max-w-3xl mx-auto py-8">
      <h1 className="text-xl font-bold">My Account</h1>
      <p className="text-sm text-slate-500 mt-1">{user.name} · {user.email}</p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-slate-500 text-sm">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium font-mono">{o.id}</p>
                  <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-1 capitalize ${statusColor[o.status] || 'bg-slate-100 text-slate-600'}`}>
                  {o.status}
                </span>
              </div>
              <p className="text-sm mt-2 text-slate-600">{o.items.length} item(s) · ₹{o.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

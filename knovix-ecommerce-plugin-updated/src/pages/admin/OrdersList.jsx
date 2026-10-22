import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../../api/orders'

const statusColor = {
  placed: 'bg-amber-50 text-amber-600',
  shipped: 'bg-blue-50 text-blue-600',
  delivered: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-red-50 text-red-600'
}

export default function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getOrders()
      .then((items) => { if (alive) setOrders(Array.isArray(items) ? items : []) })
      .catch((err) => { if (alive) setError(err.message || "Couldn't load orders.") })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Orders</h1>
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2 mb-4">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-slate-400" colSpan={6}>Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="p-4 text-slate-400" colSpan={6}>{error ? 'Orders could not be loaded.' : 'No orders yet.'}</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="p-3 font-mono">{o.id}</td>
                <td className="p-3">{o.customer?.name}</td>
                <td className="p-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-3">₹{o.total}</td>
                <td className="p-3"><span className={`text-xs font-semibold rounded-full px-2.5 py-1 capitalize ${statusColor[o.status] || 'bg-slate-100 text-slate-600'}`}>{o.status}</span></td>
                <td className="p-3 text-right"><Link to={`/admin/orders/${o.id}`} className="text-brand-700">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

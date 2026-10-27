import { useEffect, useState } from 'react'
import { getProducts } from '../../api/products'
import { getOrders } from '../../api/orders'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0 })

  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([getProducts({}, { includeHidden: true }), getOrders()])
      .then(([products, orders]) => {
        if (!alive) return
        setStats({
          products: products.length,
          orders: orders.length,
          // cancelled / refunded orders are not revenue
          revenue: orders
            .filter((o) => !['cancelled', 'refunded', 'failed'].includes(String(o.status).toLowerCase()))
            .reduce((s, o) => s + (Number(o.total) || 0), 0),
          // stock = null means "not tracked", which is not low stock
          lowStock: products.filter((p) => p.stock !== null && p.stock !== undefined && p.stock !== '' && Number(p.stock) <= 10).length
        })
      })
      .catch((err) => { if (alive) setError(err.message || "Couldn't load dashboard data.") })
    return () => { alive = false }
  }, [])

  const cards = [
    ['📦', 'Total Products', stats.products],
    ['🧾', 'Total Orders', stats.orders],
    ['💰', 'Revenue', `₹${stats.revenue.toLocaleString('en-IN')}`],
    ['⚠️', 'Low Stock Items', stats.lowStock]
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2 mb-4">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([icon, label, value]) => (
          <div key={label} className="card p-5">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getProducts } from '../../api/products'
import { getOrders } from '../../api/orders'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0 })

  useEffect(() => {
<<<<<<< HEAD
    Promise.all([getProducts(), getOrders()])
      .then(([products, orders]) => {
        setStats({
          products: products.length,
          orders: orders.length,
          revenue: orders.reduce((s, o) => s + o.total, 0),
          lowStock: products.filter((p) => p.stock <= 10).length
        })
      })
      .catch(() => setStats({ products: 0, orders: 0, revenue: 0, lowStock: 0 }))
=======
    Promise.all([getProducts(), getOrders()]).then(([products, orders]) => {
      setStats({
        products: products.length,
        orders: orders.length,
        revenue: orders.reduce((s, o) => s + o.total, 0),
        lowStock: products.filter((p) => p.stock <= 10).length
      })
    })
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
  }, [])

  const cards = [
    ['📦', 'Total Products', stats.products],
    ['🧾', 'Total Orders', stats.orders],
    ['💰', 'Revenue', `₹${stats.revenue}`],
    ['⚠️', 'Low Stock Items', stats.lowStock]
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
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

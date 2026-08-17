import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)


  useEffect(() => { getOrder(id).then(setOrder).catch(() => setOrder(null)) }, [id])

  useEffect(() => { getOrder(id).then(setOrder) }, [id])


  return (
    <div className="container-px max-w-xl mx-auto py-20 text-center">
      <p className="text-5xl mb-4">✅</p>
      <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
      <p className="text-slate-500 mt-2 text-sm">
        Order ID <span className="font-mono font-medium text-ink-900">{id}</span>
      </p>
      {order && <p className="mt-1 text-sm text-slate-500">Total paid: ₹{order.total} · {order.payment === 'cod' ? 'Cash on Delivery' : order.payment.toUpperCase()}</p>}
      <div className="flex gap-3 justify-center mt-8">
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        <Link to="/account" className="btn-primary">View My Orders</Link>
      </div>
    </div>
  )
}

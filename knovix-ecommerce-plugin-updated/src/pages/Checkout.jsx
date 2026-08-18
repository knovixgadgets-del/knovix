import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api/orders'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [payment, setPayment] = useState('cod')
  const [form, setForm] = useState({
    name: user?.name || '', phone: '', address: '', city: '', state: '', pincode: ''
  })

  if (items.length === 0) return <Navigate to="/cart" replace />

  const shipping = subtotal >= 499 ? 0 : 49
  const total = subtotal + shipping

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setError('')
    setPlacing(true)
    try {
      const order = await createOrder({
        userId: user?.id || null,
        customer: form,
        items,
        subtotal,
        shipping,
        total,
        payment
      })
      clearCart()
      navigate(`/order-success/${order.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-px max-w-5xl mx-auto py-8 grid md:grid-cols-[1fr_320px] gap-8">
      <form onSubmit={handlePlaceOrder} className="space-y-5">
        <h1 className="text-xl font-bold">Shipping Details</h1>
        {error && <p className="text-red-600 text-sm bg-red-50 rounded-md px-3 py-2">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input required className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input required className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input required className="input" value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">City</label>
            <input required className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <div>
            <label className="label">State</label>
            <input required className="input" value={form.state} onChange={(e) => update('state', e.target.value)} />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input required className="input" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Payment Method</label>
          <div className="space-y-2">
            {[['cod', 'Cash on Delivery'], ['upi', 'UPI'], ['card', 'Credit / Debit Card']].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer">
                <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button disabled={placing} className="btn-primary w-full">{placing ? 'Placing order…' : `Place Order · ₹${total}`}</button>
      </form>

      <div className="card p-5 h-fit">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm max-h-64 overflow-auto">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span className="line-clamp-1">{i.name} × {i.qty}</span>
              <span>₹{i.price * i.qty}</span>
            </div>
          ))}
        </div>
        <div className="text-sm space-y-2 border-t mt-3 pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
          <div className="flex justify-between font-semibold text-base border-t pt-2"><span>Total</span><span>₹{total}</span></div>
        </div>
      </div>
    </div>
  )
}

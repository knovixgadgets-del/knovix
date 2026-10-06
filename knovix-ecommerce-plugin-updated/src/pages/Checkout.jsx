import { useIndianStates, useShippingQuote, useShippingRules } from '../utils/shipping'
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

  const states = useIndianStates()
  const quote = useShippingQuote(items, form.state, form.pincode)
  const { freeMin } = useShippingRules()

  if (items.length === 0) return <Navigate to="/cart" replace />

  // Shipping is only ever charged once the server has priced it for a real
  // state + pincode. The merchandise value is also taken from that same
  // server quote, so a stale price saved in the cart can't make the on-screen
  // total disagree with the order that actually gets created.
  const shipping = quote.status === 'ok' ? quote.shipping : 0
  const shownSubtotal = quote.status === 'ok' && quote.subtotal != null ? quote.subtotal : subtotal
  const total = shownSubtotal + shipping
  const toFree = quote.status === 'ok' && shipping > 0 && freeMin ? Math.max(0, Math.ceil(freeMin - shownSubtotal)) : 0
  const phoneOk = form.phone.length === 10
  const canPlace = quote.status === 'ok' && phoneOk && !placing

  let shippingLabel = 'Enter state & pincode'
  if (quote.status === 'loading') shippingLabel = 'Calculating…'
  else if (quote.status === 'ok') shippingLabel = shipping === 0 ? 'Free' : `₹${shipping}`
  else if (quote.status === 'unavailable') shippingLabel = 'Not deliverable'
  else if (quote.status === 'mismatch') shippingLabel = 'Check pincode'
  else if (quote.status === 'error') shippingLabel = 'Unavailable'

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
        payment
      })
      // Flag this as a fresh order so the confirmation page can show the
      // thank-you + auto-redirect to My Orders (only once, not on later visits).
      try {
        sessionStorage.setItem('knovix_just_placed', String(order.id))
        if (order.orderKey) sessionStorage.setItem(`knovix_order_key_${order.id}`, order.orderKey)
      } catch { /* storage unavailable — confirmation still works */ }
      // Navigate first (and replace, so Back doesn't return to checkout),
      // then empty the cart, so the empty-cart guard can't bounce us to /cart.
      navigate(`/order-success/${order.id}`, { replace: true })
      clearCart()
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
            <input required inputMode="tel" maxLength={10} placeholder="10-digit mobile number" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))} />
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
            {states.length > 0 ? (
              <select required className="input" value={form.state} onChange={(e) => update('state', e.target.value)}>
                <option value="">Select state</option>
                {states.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
              </select>
            ) : (
              <input required className="input" value={form.state} onChange={(e) => update('state', e.target.value)} />
            )}
          </div>
          <div>
            <label className="label">Pincode</label>
            <input required inputMode="numeric" maxLength={6} className="input" value={form.pincode} onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))} />
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

        {form.phone.length > 0 && !phoneOk && <p className="text-red-600 text-sm">Enter a valid 10-digit mobile number.</p>}
        {quote.status === 'unavailable' && <p className="text-red-600 text-sm">Sorry, we don't deliver to this location yet.</p>}
        {quote.status === 'mismatch' && <p className="text-red-600 text-sm">This pincode doesn't match the selected state. Please check and try again.</p>}
        {quote.status === 'error' && <p className="text-red-600 text-sm">Couldn't calculate shipping. Please check your connection and retry.</p>}
        <button disabled={!canPlace} className="btn-primary w-full disabled:opacity-60">{placing ? 'Placing order…' : quote.status === 'ok' ? (phoneOk ? `Place Order · ₹${total}` : 'Enter 10-digit phone to continue') : 'Enter state & pincode to continue'}</button>
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
          <div className="flex justify-between"><span>Subtotal</span><span>₹{shownSubtotal}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span className={quote.status === 'ok' && shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shippingLabel}</span></div>
          {toFree > 0 && <p className="text-xs text-brand-700 bg-brand-50 rounded-md px-2.5 py-1.5">Add ₹{toFree} more to get free delivery</p>}
          <div className="flex justify-between font-semibold text-base border-t pt-2"><span>Total</span><span>{quote.status === 'ok' ? `₹${total}` : `₹${shownSubtotal}`}</span></div>
        </div>
      </div>
    </div>
  )
}

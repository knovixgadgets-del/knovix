import { useIndianStates, useShippingQuote, useShippingRules } from '../utils/shipping'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api/orders'
import { CheckCircleIcon } from '../components/Icons'

const POPUP_SECONDS = 6

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(null) // order returned by the server -> shows the thank-you popup
  const [error, setError] = useState('')
  const [payment, setPayment] = useState('cod')
  const [form, setForm] = useState({
    name: user?.name || '', phone: '', address: '', city: '', state: '', pincode: ''
  })

  const states = useIndianStates()
  const quote = useShippingQuote(items, form.state, form.pincode)
  const { freeMin } = useShippingRules()

  // Thank-you popup: after a few seconds, take the customer to My Orders.
  useEffect(() => {
    if (!placed) return
    const t = setTimeout(() => navigate('/account', { replace: true }), POPUP_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [placed, navigate])

  if (items.length === 0 && !placed) return <Navigate to="/cart" replace />

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
      try {
        if (order.orderKey) sessionStorage.setItem(`knovix_order_key_${order.id}`, order.orderKey)
      } catch { /* storage unavailable — popup still works */ }
      // Show the thank-you popup (instead of bouncing to the empty cart page),
      // then empty the cart.
      setPlaced({ id: order.id, total: order.total ?? total })
      clearCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-px max-w-5xl mx-auto py-8 grid md:grid-cols-[1fr_320px] gap-8">
      {placed && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 animate-[fade-in_0.2s_ease-out]" role="dialog" aria-modal="true" aria-label="Order placed">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center hero-in">
            <span className="mx-auto w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <CheckCircleIcon className="w-10 h-10" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink-900">Thank you for your order!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Order <span className="font-mono font-medium text-ink-900">#{placed.id}</span> is confirmed
              {Number(placed.total) > 0 && <> · ₹{Number(placed.total).toLocaleString('en-IN')}</>}
            </p>
            <p className="mt-2 text-sm text-slate-600">We'll keep you posted at every step.</p>
            <div className="h-1.5 rounded-full bg-brand-100 overflow-hidden mt-4">
              <div className="h-full bg-amber-400 origin-left" style={{ animation: `popup-progress ${POPUP_SECONDS}s linear forwards` }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">Taking you to your orders…</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => navigate('/account', { replace: true })} className="btn-primary flex-1">View my orders</button>
              <button type="button" onClick={() => navigate('/shop', { replace: true })} className="btn-outline flex-1">Keep shopping</button>
            </div>
          </div>
        </div>
      )}
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

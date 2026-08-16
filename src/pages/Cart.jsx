import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-px max-w-3xl mx-auto py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-slate-500 text-sm mt-2">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Start Shopping</Link>
      </div>
    )
  }

  const shipping = subtotal >= 499 ? 0 : 49
  const total = subtotal + shipping

  return (
    <div className="container-px max-w-5xl mx-auto py-8 grid md:grid-cols-[1fr_320px] gap-8">
      <div>
        <h1 className="text-xl font-bold mb-4">Shopping Cart ({items.length})</h1>
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.id} className="card p-3 flex items-center gap-4">
              <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover bg-slate-50" />
              <div className="flex-1">
                <Link to={`/product/${i.id}`} className="text-sm font-medium hover:text-brand-700">{i.name}</Link>
                <p className="text-sm text-slate-500">₹{i.price}</p>
              </div>
              <div className="flex items-center border rounded-md">
                <button onClick={() => updateQty(i.id, i.qty - 1)} className="px-2 py-1">−</button>
                <span className="px-3 text-sm">{i.qty}</span>
                <button onClick={() => updateQty(i.id, i.qty + 1)} className="px-2 py-1">+</button>
              </div>
              <p className="font-semibold text-sm w-16 text-right">₹{i.price * i.qty}</p>
              <button onClick={() => removeItem(i.id)} className="text-slate-400 hover:text-red-500">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 h-fit">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
          <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2"><span>Total</span><span>₹{total}</span></div>
        </div>
        <Link to="/checkout" className="btn-primary w-full mt-4">Proceed to Checkout</Link>
      </div>
    </div>
  )
}

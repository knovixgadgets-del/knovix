import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { stockInfo } from '../utils/format'

const CartContext = createContext(null)
const STORAGE_KEY = 'knovix_cart'

// Cart data lives in the visitor's browser, so never trust its shape: a
// corrupted or hand-edited value used to crash every page (items.reduce on a
// non-array / NaN totals). Keep only well-formed lines.
function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((i) => i && i.id !== undefined && i.id !== null)
      .map((i) => ({
        id: i.id,
        name: String(i.name || 'Product'),
        price: Number(i.price) || 0,
        mrp: Number(i.mrp) || 0,
        image: i.image || '',
        stock: i.stock === null || i.stock === undefined ? null : Number(i.stock),
        qty: Math.max(1, Math.floor(Number(i.qty) || 1))
      }))
  } catch {
    return []
  }
}

function clampQty(qty, stock) {
  const limit = stock === null || stock === undefined || !Number.isFinite(Number(stock)) ? Infinity : Math.max(1, Number(stock))
  return Math.max(1, Math.min(Math.floor(qty), limit))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Private mode / storage full: the cart still works for this session.
    }
  }, [items])

  // Keep the cart in sync if it is changed in another tab.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setItems(loadCart())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function addItem(product, qty = 1) {
    const info = stockInfo(product)
    if (info.out) return
    const stock = info.known ? info.qty : null

    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, stock, qty: clampQty(i.qty + qty, stock) } : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          mrp: Number(product.mrp) || 0,
          image: product.image || '',
          stock,
          qty: clampQty(qty, stock)
        }
      ]
    })
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function setQty(id, qty) {
    if (qty < 1) return removeItem(id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty, i.stock) } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const mrpTotal = items.reduce((sum, i) => sum + (i.mrp > i.price ? i.mrp : i.price) * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty: setQty, clearCart, subtotal, mrpTotal, savings: Math.max(0, mrpTotal - subtotal), count }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

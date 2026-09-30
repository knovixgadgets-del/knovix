import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

// Shipping rules come from WooCommerce (Settings > Shipping) via /shipping.
// These defaults are used only until the request returns, or if it fails.
const DEFAULTS = { freeMin: 199, fee: 49 }

let cached = null
let inflight = null

function loadRules() {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = apiFetch('/shipping')
      .then((r) => {
        cached = {
          freeMin: r && r.freeMin !== null && r.freeMin !== undefined ? Number(r.freeMin) : DEFAULTS.freeMin,
          fee: r && r.fee !== undefined ? Number(r.fee) : DEFAULTS.fee
        }
        return cached
      })
      .catch(() => DEFAULTS)
      .finally(() => { inflight = null })
  }
  return inflight
}

export function useShippingRules() {
  const [rules, setRules] = useState(cached || DEFAULTS)
  useEffect(() => {
    let alive = true
    loadRules().then((r) => alive && setRules(r))
    return () => { alive = false }
  }, [])
  return {
    freeMin: rules.freeMin,
    fee: rules.fee,
    getShipping: (subtotal) => (subtotal >= rules.freeMin ? 0 : rules.fee)
  }
}

// ---- Destination-aware shipping (WooCommerce shipping zones) ----

let statesCache = null
export function useIndianStates() {
  const [states, setStates] = useState(statesCache || [])
  useEffect(() => {
    if (statesCache) return
    let alive = true
    apiFetch('/shipping/states')
      .then((r) => { statesCache = Array.isArray(r) ? r : []; if (alive) setStates(statesCache) })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  return states
}

// Returns { status: 'incomplete' | 'loading' | 'ok' | 'unavailable' | 'mismatch' | 'error', shipping, zone }
export function useShippingQuote(items, state, pincode) {
  const [quote, setQuote] = useState({ status: 'incomplete' })
  const ready = !!state && /^\d{6}$/.test(String(pincode || '').trim())
  const key = JSON.stringify(items.map((i) => [i.id, i.qty]))

  useEffect(() => {
    if (!ready) { setQuote({ status: 'incomplete' }); return }
    setQuote({ status: 'loading' })
    let alive = true
    const t = setTimeout(() => {
      apiFetch('/shipping/quote', {
        method: 'POST',
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })), state, pincode })
      })
        .then((r) => {
          if (!alive) return
          if (r && r.available) setQuote({ status: 'ok', shipping: Number(r.shipping), zone: r.zone })
          else setQuote({ status: r && (r.reason === 'unavailable' || r.reason === 'mismatch') ? r.reason : 'incomplete' })
        })
        .catch(() => alive && setQuote({ status: 'error' }))
    }, 350)
    return () => { alive = false; clearTimeout(t) }
  }, [ready, state, pincode, key])

  return quote
}

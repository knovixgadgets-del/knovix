import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

// Shipping rules come from WooCommerce (Settings > Shipping) via /shipping.
// These defaults are used only until the request returns, or if it fails.
const DEFAULTS = { freeMin: null, fee: null } // unknown until /shipping answers - never advertise an invented number

let cached = null
let inflight = null

function loadRules() {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = apiFetch('/shipping')
      .then((r) => {
        cached = {
          freeMin: r && r.freeMin !== null && r.freeMin !== undefined ? Number(r.freeMin) : null,
          fee: r && r.fee !== null && r.fee !== undefined ? Number(r.fee) : null
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
    getShipping: (subtotal) => (rules.freeMin !== null && subtotal >= rules.freeMin ? 0 : (rules.fee || 0))
  }
}

// ---- Destination-aware shipping (WooCommerce shipping zones) ----

// The 28 Indian states shown in the checkout address. Kerala, Tamil Nadu and
// Karnataka are pinned to the top (our main delivery region), the rest follow
// alphabetically. The value sent to the backend is the state NAME - the server
// resolves it to the WooCommerce state code (knovix_state_code), so this list
// doesn't depend on which state codes a given WooCommerce version uses.
const PRIORITY_STATES = ['Kerala', 'Tamil Nadu', 'Karnataka']
const OTHER_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal'
]
const INDIAN_STATES = [...PRIORITY_STATES, ...OTHER_STATES].map((name) => ({ code: name, name }))

export function useIndianStates() {
  return INDIAN_STATES
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
          if (r && r.available) setQuote({ status: 'ok', shipping: Number(r.shipping), zone: r.zone, subtotal: Number.isFinite(Number(r.subtotal)) ? Number(r.subtotal) : null })
          else setQuote({ status: r && (r.reason === 'unavailable' || r.reason === 'mismatch') ? r.reason : 'incomplete' })
        })
        .catch(() => alive && setQuote({ status: 'error' }))
    }, 350)
    return () => { alive = false; clearTimeout(t) }
  }, [ready, state, pincode, key])

  return quote
}

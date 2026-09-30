import { localDb } from '../data/localStore'
import { apiFetch } from './client'

const USE_WORDPRESS = true

export function createOrder(order) {
  if (USE_WORDPRESS) return apiFetch('/orders', { method: 'POST', body: JSON.stringify(order) })
  return localDb.createOrder(order)
}

export function getOrders(params = {}) {
  if (USE_WORDPRESS) {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/orders?${qs}`)
  }
  return localDb.listOrders(params)
}

// `key` is the order key returned when the order was placed; it lets a guest
// (not logged in) re-open their own confirmation without exposing other orders.
export function getOrder(id, key) {
  if (USE_WORDPRESS) return apiFetch(`/orders/${id}${key ? `?key=${encodeURIComponent(key)}` : ''}`)
  return localDb.getOrder(id)
}

export function updateOrderStatus(id, status) {
  if (USE_WORDPRESS) return apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  return localDb.updateOrderStatus(id, status)
}

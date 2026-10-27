import { apiFetch } from './client'

export function createOrder(order) {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(order) })
}

export function getOrders(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(qs ? `/orders?${qs}` : '/orders')
}

// `key` is the order key returned when the order was placed; it lets a guest
// (not logged in) re-open their own confirmation without exposing other orders.
export function getOrder(id, key) {
  return apiFetch(`/orders/${id}${key ? `?key=${encodeURIComponent(key)}` : ''}`)
}

export function updateOrderStatus(id, status) {
  return apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

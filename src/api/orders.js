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

export function getOrder(id) {
  if (USE_WORDPRESS) return apiFetch(`/orders/${id}`)
  return localDb.getOrder(id)
}

export function updateOrderStatus(id, status) {
  if (USE_WORDPRESS) return apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  return localDb.updateOrderStatus(id, status)
}

import { localDb } from '../data/localStore'
import { apiFetch } from './client'

// Flip this to true once the WordPress plugin (wordpress-plugin/knovix-api-bridge)
// is installed and VITE_API_BASE_URL is set — every function below already
// calls the matching /wp-json/knovix/v1/... route.

const USE_WORDPRESS = true

export function getCategories() {
  if (USE_WORDPRESS) return apiFetch('/categories')
  return localDb.listCategories()
}

export function getProducts(filters = {}) {
  if (USE_WORDPRESS) {
    const qs = new URLSearchParams(filters).toString()
    return apiFetch(`/products?${qs}`)
  }
  return localDb.listProducts(filters)
}

export function getProduct(id) {
  if (USE_WORDPRESS) return apiFetch(`/products/${id}`)
  return localDb.getProduct(id)
}

// admin only
export function createProduct(payload) {
  if (USE_WORDPRESS) return apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) })
  return localDb.createProduct(payload)
}
export function updateProduct(id, payload) {
  if (USE_WORDPRESS) return apiFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  return localDb.updateProduct(id, payload)
}
export function deleteProduct(id) {
  if (USE_WORDPRESS) return apiFetch(`/products/${id}`, { method: 'DELETE' })
  return localDb.deleteProduct(id)
}

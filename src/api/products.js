import { localDb } from '../data/localStore'
import { apiFetch } from './client'

// Flip this to true once the WordPress plugin (wordpress-plugin/knovix-api-bridge)
// is installed and VITE_API_BASE_URL is set — every function below already
// calls the matching /wp-json/knovix/v1/... route.

const USE_WORDPRESS = true

// Reads fall back to the local demo catalog if the WordPress API is
// unreachable (not configured yet, CORS, downtime, etc). This keeps the
// storefront browsable instead of silently rendering empty product
// sections or spinning on "Loading…" forever. Failures are logged so the
// gap is still visible during development.
export async function getCategories() {
  if (USE_WORDPRESS) {
    try {
      return await apiFetch('/categories')
    } catch (err) {
      console.warn('[knovix] /categories failed, using demo data:', err.message)
      return localDb.listCategories()
    }
  }
  return localDb.listCategories()
}

export async function getProducts(filters = {}) {
  if (USE_WORDPRESS) {
    try {
      const qs = new URLSearchParams(filters).toString()
      return await apiFetch(`/products?${qs}`)
    } catch (err) {
      console.warn('[knovix] /products failed, using demo data:', err.message)
      return localDb.listProducts(filters)
    }
  }
  return localDb.listProducts(filters)
}

export async function getProduct(id) {
  if (USE_WORDPRESS) {
    try {
      return await apiFetch(`/products/${id}`)
    } catch (err) {
      console.warn('[knovix] /products/:id failed, using demo data:', err.message)
      return localDb.getProduct(id)
    }
  }
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

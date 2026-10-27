import { apiFetch } from './client'

// The WordPress/Knovix API sometimes wraps list results in an envelope
// (e.g. { data: [...] }, { products: [...] }, { items: [...] }) instead of
// returning a bare array. Pages like Home.jsx call `.filter()`/`.map()`
// directly on what these functions return, so an unwrapped non-array
// response crashes rendering with no error boundary to catch it (blank
// page). Normalize here once so every caller always gets a plain array.
function toArray(response) {
  if (Array.isArray(response)) return response

  if (response && typeof response === 'object') {
    for (const key of ['data', 'products', 'categories', 'items', 'results']) {
      if (Array.isArray(response[key])) return response[key]
    }
  }

  console.warn('[knovix] expected an array from the API, got:', response)
  return []
}

// Every function below talks to the live WordPress/Knovix API only — there
// is no local/demo-data fallback. If a request fails the error is thrown and
// it's up to the calling page to show its own loading/error/empty state,
// rather than silently showing dummy products in place of real store data.

// Placeholder/seed entries (WooCommerce sample data, "Test Product", etc.)
// sometimes linger in a store's catalog from setup. Filter them out here so
// they can't reach the storefront even if they're still present in WP.
const DUMMY_NAME_PATTERN = /\b(test product|dummy|sample product|lorem ipsum|placeholder)\b/i

function isDummyProduct(p) {
  if (!p || typeof p !== 'object') return true
  const name = (p.name || '').trim()
  if (!name) return true
  return DUMMY_NAME_PATTERN.test(name)
}

// NOTE: these two deliberately let request errors propagate. They used to catch
// them and return [], which made a dead/unreachable backend look like an empty
// store: no error message, no Retry button, just blank sections. Every caller
// already has a .catch() that shows its own error / retry UI.
export async function getCategories() {
  return toArray(await apiFetch('/categories'))
}

// `options.includeHidden` skips the storefront's "dummy product" filter. The admin
// panel uses it so staff can still see (and delete) test/placeholder products
// that are hidden from customers.
export async function getProducts(filters = {}, options = {}) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ''
    )
  )

  const qs = new URLSearchParams(cleanFilters).toString()

  const items = toArray(await apiFetch(
    qs ? `/products?${qs}` : '/products'
  ))
  return options.includeHidden ? items.filter((p) => p && typeof p === 'object') : items.filter((p) => !isDummyProduct(p))
}

export async function getProduct(id) {
  return apiFetch(`/products/${id}`)
}

// Admin only
export function createProduct(payload) {
  return apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProduct(id, payload) {
  return apiFetch(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
  })
}
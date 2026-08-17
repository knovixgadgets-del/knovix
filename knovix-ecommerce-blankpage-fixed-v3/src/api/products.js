import { localDb } from '../data/localStore'
import { apiFetch } from './client'

const USE_WORDPRESS = true

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

export async function getCategories() {
  if (USE_WORDPRESS) {
    try {
      return toArray(await apiFetch('/categories'))
    } catch (err) {
      console.warn(
        '[knovix] /categories failed, using demo data:',
        err.message
      )

      return localDb.listCategories()
    }
  }

  return localDb.listCategories()
}

export async function getProducts(filters = {}) {
  if (USE_WORDPRESS) {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ''
        )
      )

      const qs = new URLSearchParams(cleanFilters).toString()

      return toArray(await apiFetch(
        qs ? `/products?${qs}` : '/products'
      ))
    } catch (err) {
      console.warn(
        '[knovix] /products failed, using demo data:',
        err.message
      )

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
      console.warn(
        '[knovix] /products/:id failed, using demo data:',
        err.message
      )

      return localDb.getProduct(id)
    }
  }

  return localDb.getProduct(id)
}

// Admin only
export function createProduct(payload) {
  if (USE_WORDPRESS) {
    return apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  return localDb.createProduct(payload)
}

export function updateProduct(id, payload) {
  if (USE_WORDPRESS) {
    return apiFetch(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  return localDb.updateProduct(id, payload)
}

export function deleteProduct(id) {
  if (USE_WORDPRESS) {
    return apiFetch(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  return localDb.deleteProduct(id)
}
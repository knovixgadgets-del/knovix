import { apiFetch } from './client'

const USE_WORDPRESS = true

// Normalize API list responses to a plain array.
function toArray(response) {
  if (Array.isArray(response)) return response

  if (response && typeof response === 'object') {
    for (const key of [
      'data',
      'products',
      'categories',
      'items',
      'results',
    ]) {
      if (Array.isArray(response[key])) {
        return response[key]
      }
    }
  }

  console.error(
    '[knovix] Expected an array from WordPress API, got:',
    response
  )

  return []
}

export async function getCategories() {
  if (!USE_WORDPRESS) {
    return []
  }

  try {
    return toArray(await apiFetch('/categories'))
  } catch (err) {
    console.error(
      '[knovix] WordPress /categories failed:',
      err
    )

    throw err
  }
}

export async function getProducts(filters = {}) {
  if (!USE_WORDPRESS) {
    return []
  }

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

    const endpoint = qs
      ? `/products?${qs}`
      : '/products'

    console.log('[knovix] Loading products from WordPress:', endpoint)

    return toArray(await apiFetch(endpoint))
  } catch (err) {
    console.error(
      '[knovix] WordPress /products failed:',
      err
    )

    // IMPORTANT:
    // Do NOT fall back to local/demo products.
    throw err
  }
}

export async function getProduct(id) {
  if (!USE_WORDPRESS) {
    return null
  }

  try {
    return await apiFetch(`/products/${id}`)
  } catch (err) {
    console.error(
      `[knovix] WordPress /products/${id} failed:`,
      err
    )

    // IMPORTANT:
    // Do NOT load a dummy product.
    throw err
  }
}

// Admin only
export function createProduct(payload) {
  if (!USE_WORDPRESS) {
    throw new Error('WordPress API is disabled')
  }

  return apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProduct(id, payload) {
  if (!USE_WORDPRESS) {
    throw new Error('WordPress API is disabled')
  }

  return apiFetch(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteProduct(id) {
  if (!USE_WORDPRESS) {
    throw new Error('WordPress API is disabled')
  }

  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
  })
}
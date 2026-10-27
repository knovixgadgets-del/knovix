// Small shared helpers so every page formats money, stock and descriptions the same way.

// 1299 -> "1,299" (Indian digit grouping). Never renders NaN.
export const inr = (n) => (Number(n) || 0).toLocaleString('en-IN')

// WooCommerce products that don't manage stock come back with stock = null.
// Treat that as "in stock, no known limit" instead of "0 left" or "null left".
export function stockInfo(product) {
  const raw = product?.stock
  const flaggedOut = product?.inStock === false || product?.in_stock === false

  if (raw === null || raw === undefined || raw === '' || !Number.isFinite(Number(raw))) {
    return { known: false, qty: Infinity, out: flaggedOut, low: false }
  }

  const qty = Number(raw)
  return { known: true, qty, out: flaggedOut || qty <= 0, low: qty > 0 && qty <= 10 }
}

// Product descriptions from WordPress can contain HTML (<p>, <br>, <ul>...).
// Rendering that as plain text shows raw tags, and injecting it as HTML would be
// an XSS risk, so convert it to safe plain text with line breaks.
export function stripHtml(html) {
  if (!html) return ''
  const source = String(html)
  if (!/[<&]/.test(source)) return source

  try {
    const withBreaks = source
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
    const doc = new DOMParser().parseFromString(withBreaks, 'text/html')
    return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
  } catch {
    return source.replace(/<[^>]*>/g, '')
  }
}

// Percent discount between MRP and selling price (0 when there is no real discount).
export function discountPercent(mrp, price) {
  const m = Number(mrp) || 0
  const p = Number(price) || 0
  return m > p && m > 0 ? Math.round(((m - p) / m) * 100) : 0
}

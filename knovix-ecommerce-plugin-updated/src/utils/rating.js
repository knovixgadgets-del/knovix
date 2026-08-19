// Some products coming from the store don't have a rating yet. Rather than
// showing an unrated/blank card, give them a stable fallback rating picked
// from a small set of realistic values — stable per product (based on its
// id) so it doesn't change on every re-render.
const FALLBACK_RATINGS = [4.3, 4.5, 5]

export function getDisplayRating(product) {
  if (!product) return 0
  if (product.rating && product.rating > 0) return product.rating

  const seed = String(product.id ?? '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

  return FALLBACK_RATINGS[seed % FALLBACK_RATINGS.length]
}

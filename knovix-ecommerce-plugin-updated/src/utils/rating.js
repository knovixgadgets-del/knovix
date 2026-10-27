// Only ever show a rating that real customers gave. This used to invent a
// 4.3 / 4.5 / 5.0 rating for any product without reviews, which shows shoppers
// fake social proof (and is not allowed for Indian e-commerce sellers).
export function getDisplayRating(product) {
  const rating = Number(product?.rating)
  return Number.isFinite(rating) && rating > 0 ? Math.min(5, rating) : 0
}

export function hasRating(product) {
  return getDisplayRating(product) > 0
}

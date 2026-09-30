// Single source of truth for shipping rules (keep in sync with
// KNOVIX_FREE_SHIPPING_MIN / KNOVIX_SHIPPING_FEE in the WordPress plugin).
export const FREE_SHIPPING_THRESHOLD = 199
export const SHIPPING_FEE = 49

export function getShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

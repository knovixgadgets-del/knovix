export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?sort=price_asc', label: 'Deals' },
  { to: '/shop?sort=newest', label: 'New Arrivals' },
  { to: '/brands', label: 'Brands' },
  { to: '/blog', label: 'Blog' },
  { to: '/shop?sort=rating', label: 'Best Rated' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/contact', label: 'Contact' }
]

// Mobile menu drops Deals / New Arrivals / Brands — they live in the single
// quick-nav strip under the mobile search bar instead (see quickLinks
// below), so they don't appear a second time inside the mobile menu sheet.
const mobileHiddenLabels = ['Deals', 'New Arrivals', 'Brands']
export const mobileNavLinks = navLinks.filter((l) => !mobileHiddenLabels.includes(l.label))

// Single source of truth for the Deals / New Arrivals / Brands quick links —
// rendered in exactly one place per breakpoint: the desktop nav row, and a
// chip strip under the mobile search bar.
export const quickLinks = [
  { to: '/shop?sort=price_asc', label: 'Deals', icon: '🔥' },
  { to: '/shop?sort=newest', label: 'New Arrivals', icon: '✨' },
  { to: '/brands', label: 'Brands', icon: '🏷️' }
]

// Minimal outline vector icons — same visual language as Amazon's app nav
// (thin stroke, rounded joins, currentColor so they inherit text color).
// Kept as plain inline SVG instead of adding an icon-library dependency,
// so nothing new needs installing.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function HomeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

export function ShopIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  )
}

export function AccountIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  )
}

export function CartIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="9.5" cy="20" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20" r="1.1" fill="currentColor" stroke="none" />
      <path d="M3 4h2l1.6 10.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20 8H6.2" />
    </svg>
  )
}

export function MenuIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 6.5h16" />
      <path d="M4 12h16" />
      <path d="M4 17.5h16" />
    </svg>
  )
}

export function CameraIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.6l1-1.6a1.5 1.5 0 0 1 1.3-.7h5.2a1.5 1.5 0 0 1 1.3.7l1 1.6h1.6A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5Z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  )
}

// Magnifying-glass "lens" search icon — same stroke weight/style as the
// rest of the set, sized and paired with CameraIcon the way Amazon's
// search bar pairs a lens icon with a camera/lens-scan icon.
export function SearchIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  )
}

export function HeartIcon({ className = 'w-5 h-5', filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...base}
      fill={filled ? 'currentColor' : 'none'}
    >
      <path d="M12 20.2s-7.3-4.4-9.8-9C.6 7.7 2.4 4 6 4c2.1 0 3.6 1.2 6 3.6C14.4 5.2 15.9 4 18 4c3.6 0 5.4 3.7 3.8 7.2-2.5 4.6-9.8 9-9.8 9Z" />
    </svg>
  )
}

// Grid/menu "categories" icon — used next to the logo (opposite side) as
// an "All Categories" entry point, the way most ecommerce apps balance
// the header with logo on one side and a categories/menu affordance on
// the other.
export function CategoryIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.3" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.3" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.3" />
    </svg>
  )
}

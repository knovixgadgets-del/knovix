// ─────────────────────────────────────────────────────────────────────────
//  HOME PAGE CONTENT — edit this file in VS Code, save, and the home page
//  updates. (Big banner pictures/text are in  src/data/homeBanners.js ;
//  banner text colours/sizes are in  src/styles/banner.css ;
//  tab-bar / rail colours are in  src/styles/home.css )
// ─────────────────────────────────────────────────────────────────────────

// 1) SHOW / HIDE whole sections — true = show, false = hide
export const homeShow = {
  categoryTabs: true,   // coloured icon tab bar at the very top
  banners: true,        // rounded banner slider
  trustBadges: true,    // Free shipping / 24-7 support / replacement strip
  lookingRail: true,    // "Still looking for these?" product row
  promoTiles: true,     // picture tile grid
  categoryGrid: true,   // Shop By Category tiles
  featured: true,       // Featured Products
  deals: true,          // Flash sale + Mega Deals
  bestSellers: true,    // Best Sellers
  newsletter: true      // email subscribe strip
}

// 2) TOP TAB BAR
//  null  = automatic: built from your store categories (recommended).
//  Or write your own list. icon: bag | phone | watch | laptop | car |
//  headphones | bolt | tag | box | category
//  Example:
//   export const categoryTabs = [
//     { label: 'For You',  icon: 'bag',   href: '/' },
//     { label: 'Mobiles',  icon: 'phone', href: '/shop?search=mobile' },
//     { label: 'Watches',  icon: 'watch', href: '/shop?search=watch' }
//   ]
export const categoryTabs = null

// 3) TRUST STRIP under the banner. icon: truck | phone | box | check
//   {freeMin} is replaced with your free-shipping amount automatically.
export const trustBadges = [
  { icon: 'truck', title: 'Free Shipping', sub: 'On orders above ₹{freeMin}' },
  { icon: 'phone', title: '24/7 Customer Support', sub: 'Tap to call us', href: 'tel:+919447477665' },
  { icon: 'box', title: 'Easy Replacement', sub: '7 Days' },
  { icon: 'check', title: 'Secure Checkout', sub: 'Safe & protected' }
]

// 4) "STILL LOOKING FOR THESE?" ROW
//  source   : 'recent'   = products the visitor viewed before (falls back
//                          to the fallback below when they have none)
//             'featured' | 'deals' | 'bestSellers' | 'all'
//  {name} in titleWithName is replaced by the logged-in customer's first name.
export const lookingRail = {
  source: 'recent',
  title: 'Still looking for these?',
  titleWithName: '{name}, still looking for these?',
  fallbackSource: 'featured',
  fallbackTitle: 'Recommended for you',
  max: 8
}

// 5) PICTURE TILES (3 per row on phone, 6 on desktop).
//  image : file in public/home/  e.g. '/home/my-tile.jpg' (portrait ~600x800)
//  href  : where it opens, e.g. '/shop?search=earbuds', '/product/123'
//  tag   : tiny label on the corner ('' for none, e.g. 'NEW', 'AD')
//  The tile-*.svg pictures are DUMMY — replace them with your own.
export const promoTiles = [
  { id: 't1', image: '/home/tile-1.svg', href: '/shop?search=earbuds', label: 'Earbuds', tag: 'NEW' },
  { id: 't2', image: '/home/tile-2.svg', href: '/shop?search=charger', label: 'Chargers', tag: '' },
  { id: 't3', image: '/home/tile-3.svg', href: '/shop?search=watch', label: 'Smart Watches', tag: '' },
  { id: 't4', image: '/home/tile-4.svg', href: '/shop?search=power bank', label: 'Power Banks', tag: '' },
  { id: 't5', image: '/home/tile-5.svg', href: '/shop?search=car', label: 'Car Accessories', tag: '' },
  { id: 't6', image: '/home/tile-6.svg', href: '/shop?search=case', label: 'Phone Cases', tag: '' }
]

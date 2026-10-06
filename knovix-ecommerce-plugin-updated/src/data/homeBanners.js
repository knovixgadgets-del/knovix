// ─────────────────────────────────────────────────────────────────────────
//  HOME PAGE BANNERS — edit this file in VS Code to change the hero banners.
//  Save, and the site (npm run dev) updates instantly. Add, remove or reorder
//  items freely; they auto-loop in the order listed.
//
//  eyebrow  : small yellow line above the heading
//  title    : main heading (white)
//  accent   : last word, shown in yellow script style (use '' for none)
//  subtitle : one short supporting line
//  cta      : button label
//  href     : where the button goes, e.g. '/shop', '/shop?sort=rating',
//             '/product/123', '/contact'
//  image    : OPTIONAL full-width background picture for that banner. Put the
//             file in the project's  public/banners/  folder and write
//             '/banners/my-banner.jpg'. Leave '' for the plain Knovix navy.
//             (Wide landscape pictures, about 1600x700, work best.)
// ─────────────────────────────────────────────────────────────────────────
export const homeBanners = [
  {
    id: 'upgrade',
    eyebrow: 'NEW SEASON. NEW TECH.',
    title: 'Upgrade Your Everyday',
    accent: 'Tech.',
    subtitle: 'Latest gadgets. Premium brands. Performance you can trust.',
    cta: 'Shop Now',
    href: '/shop',
    image: ''
  },
  {
    id: 'power',
    eyebrow: 'SMART ACCESSORIES',
    title: 'Power Up Your',
    accent: 'Day.',
    subtitle: 'Chargers, cables and mobile accessories made for everyday use.',
    cta: 'Shop Accessories',
    href: '/shop',
    image: ''
  },
  {
    id: 'trending',
    eyebrow: 'TRENDING NOW',
    title: "Gadgets You'll",
    accent: 'Love.',
    subtitle: 'Discover smart gadgets, electronics and everyday technology.',
    cta: 'Shop Best Rated',
    href: '/shop?sort=rating',
    image: ''
  }
]

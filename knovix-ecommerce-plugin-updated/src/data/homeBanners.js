// ─────────────────────────────────────────────────────────────────────────
//  HOME PAGE BANNERS — edit this file in VS Code to change the hero banners.
//  Save, and the site (npm run dev) updates instantly. Add, remove or reorder
//  items freely; they auto-loop in the order listed.
//
//  TEXT FIELDS
//   eyebrow  : small line above the heading
//   title    : main heading
//   accent   : last word, shown in script style (use '' for none)
//   subtitle : one short supporting line
//   cta      : button label
//   href     : where the button goes, e.g. '/shop', '/shop?sort=rating',
//              '/product/123', '/contact'
//
//  PICTURE
//   image    : full-width background picture. Put the file in public/banners/
//              and write '/banners/my-banner.jpg'  (about 1600x700 works best).
//              Leave '' for the plain Knovix navy background.
//              Pictures always fill the banner (cover) and stay centred.
//   imageMobile : OPTIONAL separate picture for phones, e.g. '/banners/my-banner-mobile.jpg'
//              (square-ish / portrait crop). Desktop keeps using  image.
//   showText : OPTIONAL. Set  showText: false  when the picture already has
//              its own text baked in — then no text/dark overlay is added and
//              the whole banner is simply clickable (goes to href).
//   imagePosition : OPTIONAL, which part of the picture stays visible when
//              cropped on phones, e.g. 'center top', 'left center', '70% 50%'.
//              Default is 'center center'. Add it inside any banner { ... }.
//              The 3 banners below use DUMMY pictures — replace them.
//
//  LOOK (optional)
//   theme    : name of a text style from src/styles/banner.css
//              'default' | 'bold' | 'light' | 'center' | 'left'
//              (text is centred by default; use 'left' for left-aligned)
//              (add your own by copying a  .hb-theme-xxx  block in banner.css)
//
//  HOW TO ADD A BANNER: copy one { ... }, paste it after a comma, give it a
//  new unique id, and change the text/picture.
//
//  HOW TO STYLE THE TEXT (font size, colour, button...): open
//  src/styles/banner.css — everything is in the first block at the top.
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
    image: '/banners/6530.jpg',
    theme: 'default'
  },
  {
    id: 'power',
    eyebrow: 'SMART ACCESSORIES',
    title: 'Power Up Your',
    accent: 'Day.',
    subtitle: 'Chargers, cables and mobile accessories made for everyday use.',
    cta: 'Shop Accessories',
    href: '/shop',
    image: '/banners/5177315.jpg',
    theme: 'bold'
  },
  {
    id: 'trending',
    eyebrow: 'TRENDING NOW',
    title: "Gadgets You'll",
    accent: 'Love.',
    subtitle: 'Discover smart gadgets, electronics and everyday technology.',
    cta: 'Shop Best Rated',
    href: '/shop?sort=rating',
    image: '/banners/FP-01-01.jpg',
    theme: 'default'
  }
]

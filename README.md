# Knovix Gadgets — E-commerce Frontend

A full storefront + admin panel built in the Knovix Gadgets theme (teal/dark,
rounded cards, the layout from the reference screenshot): home page, shop with
filters, product detail, cart, wishlist, checkout, auth, order history, and an
admin panel for managing products and orders.

## Stack
React 18 + Vite + React Router + Tailwind CSS. No backend framework included —
this is a frontend built against a clear API contract so you can wire up your
own backend (Node/Express, Django, Laravel, Firebase, whatever) without
touching any page or component.

## Fixes applied in this copy
- `vite.config.js`: the deploy path (`base`) is no longer hardcoded to `/shop/`.
  It now defaults to `/` (site at the domain root). If you're deploying into a
  subfolder like `public_html/shop/`, build with:
  `VITE_BASE_PATH=/shop/ npm run build`
  A mismatch between this and where `dist/` is actually uploaded is what causes
  blank pages / broken images / everything 404ing.
- `public/.htaccess`: the rewrite target was an absolute `/index.html`, which
  404s on page refresh whenever the site isn't installed at the server root.
  Changed to a relative `index.html` so it works at root or in a subfolder.
- `wordpress-plugin/knovix-api-bridge/knovix-api-bridge.php`: it was sending
  `Access-Control-Allow-Origin: *` together with `Access-Control-Allow-Credentials: true`,
  a combination browsers reject outright — every API call from a different
  origin would fail. Now `Allow-Credentials` is only sent once you set a real
  `KNOVIX_FRONTEND_ORIGIN`.
- `.env`: flagged — `plum-chimpanzee-542556.hostingersite.com` looks like
  Hostinger's temporary auto-generated domain, not a real site address.
  Replace it with your actual WordPress domain, and make sure the
  `knovix-api-bridge` plugin + WooCommerce are actually installed/active there.

## Run it
```bash
npm install
npm run dev
```
Opens at http://localhost:5173. Works immediately with **no backend** — it
uses a local mock database (`src/data/localStore.js`, backed by
`localStorage`) seeded from `src/data/mockData.js`.

Demo accounts:
- Customer — `demo@knovix.com` / `demo1234`
- Admin — `admin@knovix.com` / `admin123` (unlocks `/admin`)

## Deploying

`npm run build` produces a `dist/` folder — the entire deployable frontend
(static HTML/JS/CSS, no Node server required to run it). This repo already
includes the config each host needs for React Router's client-side routes
to work when someone loads a URL like `/shop` directly:
- `public/_redirects` — Netlify (copied into `dist/` automatically on build)
- `vercel.json` — Vercel
- `public/.htaccess` — Apache / most shared hosting (also copied into `dist/` automatically)

**Separate hosting (recommended):** deploy `dist/` to Netlify, Vercel, or
any static host, with `VITE_API_BASE_URL` pointing at your WordPress site.
WordPress only ever serves the API — nothing about wp-admin changes.

**Same-server hosting:** if you'd rather serve everything from your
existing WordPress hosting, upload the contents of `dist/` into a subfolder
(e.g. `public_html/shop/`) alongside WordPress, keep the `.htaccess` from
`public/` in that same folder, and set `VITE_API_BASE_URL` to your site's
own domain before building. wp-admin keeps working normally at `/wp-admin`.

## Connecting to WordPress / WooCommerce
See `wordpress-plugin/` — a ready-made plugin (`knovix-api-bridge`) that
turns a WordPress + WooCommerce site into this app's backend, matching the
contract below exactly. Install it, set `VITE_API_BASE_URL` to your WP
site, and flip `USE_WORDPRESS = true` at the top of each file in `src/api/`.

## Connecting any other backend
All data access goes through three files — nothing else in the app talks to
storage directly:

- `src/api/products.js` — categories, product CRUD
- `src/api/auth.js` — login, signup, logout, session
- `src/api/orders.js` — create/list/update orders

Each exported function currently calls the local mock DB. Above every mock
call there's a commented-out `apiFetch(...)` line showing the real request —
uncomment it (and delete the mock line) to point that function at your
backend. `src/api/client.js` reads `VITE_API_BASE_URL` from a `.env` file, so
set that once your backend is deployed:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Expected REST contract
| Method | Path | Purpose |
|---|---|---|
| GET | /api/categories | list categories |
| GET | /api/products?category=&search=&sort= | list/filter products |
| GET | /api/products/:id | product detail |
| POST | /api/products | create product (admin) |
| PATCH | /api/products/:id | update product (admin) |
| DELETE | /api/products/:id | delete product (admin) |
| POST | /api/auth/signup | { name, email, password } |
| POST | /api/auth/login | { email, password } |
| POST | /api/auth/logout | — |
| GET | /api/auth/session | current user or 401 |
| POST | /api/orders | create order |
| GET | /api/orders?userId= | list orders (omit userId for admin/all) |
| GET | /api/orders/:id | order detail |
| PATCH | /api/orders/:id/status | update order status (admin) |

Data shapes (Product, Order, User) mirror what's in `src/data/mockData.js` —
match those field names on your backend and the UI needs no changes.

## Project structure
```
src/
  api/            data-access layer (swap mock -> real backend here only)
  data/           seed data + the localStorage mock DB
  context/        Auth, Cart, Wishlist (React context, global state)
  components/     Header, Footer, ProductCard, route guards, etc.
  layouts/        StoreLayout (storefront) and AdminLayout (admin panel)
  pages/          storefront pages
  pages/admin/    admin dashboard, product & order management
```

## Notes
- Cart and wishlist persist in `localStorage` independent of the mock DB —
  swap the backend and they still work as-is.
- Checkout is Cash on Delivery / UPI / Card as *selectable options* — no
  payment gateway is wired in. Plug in Razorpay/Stripe inside
  `src/pages/Checkout.jsx`'s `handlePlaceOrder`.
- Admin routes (`/admin/*`) are guarded client-side by `AdminRoute`; a real
  backend must also enforce this server-side (don't trust the client).

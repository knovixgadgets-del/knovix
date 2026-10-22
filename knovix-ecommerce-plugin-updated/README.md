# Knovix Gadgets — E-commerce Frontend

## Bug-fix pass (latest) — why the "backend" didn't load, and what was fixed

**How to test the backend in 10 seconds:** open `<VITE_API_BASE_URL>/wp-json/knovix/v1/health` in a
browser. `{"ok":true,...}` = plugin is installed and reachable. HTML / 404 / redirect = wrong
`VITE_API_BASE_URL` or plugin not active. Then open `.../wp-json/knovix/v1/products` — you should see JSON.

### Frontend
- `api/products.js`: `getProducts()` / `getCategories()` swallowed every error and returned `[]`, so an
  unreachable backend looked like an empty store — no error message, no Retry button, blank sections.
  Errors now propagate and the existing error/Retry UI shows.
- `api/client.js`: detects a 200 response that isn't JSON (HTML page from a wrong domain/redirect) and
  reports it; only retries transient failures; sends the token in `X-Knovix-Token` as well as
  `Authorization` (see backend note); warns in the console if `VITE_API_BASE_URL` is empty.
- `api/auth.js` + `AuthContext`: guests (no token) no longer fire a blocking `/auth/session` call; the
  loading flag is always cleared (previously `/checkout`, `/account`, `/admin` stayed blank for 25 s+ when
  the server was slow); logout works even if the server is unreachable; expired tokens are dropped.
- `Login.jsx`: **new phone customers were stuck** — the "What should we call you?" step re-submitted the
  already-used one-time OTP and always failed with "code expired". It now calls a new `/auth/profile`
  endpoint. Removed pre-filled demo credentials from the live login form.
- Removed duplicated fetch code (copy/paste leftovers) in `Wishlist`, `Dashboard`, `ProductsList`,
  `OrdersList`; added loading/error states; admin actions now show errors instead of failing silently.
- Added a top-level `ErrorBoundary` (a single render error used to blank the whole site).
- `vite.config.js`: now actually supports `VITE_BASE_PATH` (the README said it did).
- Deleted unused `src/api/wordpress.js` (duplicate, unsafe API client).

### WordPress plugin (`knovix-api-bridge`)
- **Authorization header stripped by LiteSpeed/FastCGI hosts (Hostinger):** logins "worked" but the session
  was never recognised, orders returned 401, admin failed. Plugin now also accepts `X-Knovix-Token`
  and `REDIRECT_HTTP_AUTHORIZATION`.
- **Token check was O(number of users) with a slow password hash on every request** — now one indexed
  SHA-256 lookup. (Existing logged-in customers will simply need to log in once again.)
- CORS rewritten: multiple allowed origins (`KNOVIX_FRONTEND_ORIGIN` may be comma-separated), correct
  `Origin` echo + `Vary`, `X-Knovix-Token` allowed, and preflight `OPTIONS` answered with a clean 204.
- New `GET /health` route; if WooCommerce is inactive the API now returns a clear 503 JSON instead of a fatal error.
- New `POST /auth/profile` (sets the customer's name after OTP signup).
- `/products` returned at most 24 products; now returns the catalogue (limit 500, `?limit=` supported).
- Editing a product no longer re-publishes drafts, and no longer re-downloads the same image into the
  media library on every save.
- Signup now validates email/password length.

### If it still doesn't load
1. `.../wp-json/knovix/v1/health` must return JSON (see above). Use the site's final domain — temporary
   `*.hostingersite.com` addresses often redirect after a domain is connected, and browsers refuse
   redirects on cross-origin API calls.
2. WooCommerce must be active, and Settings > Permalinks must not be "Plain" (or use `/index.php?rest_route=`).
3. Security/cache plugins (Wordfence, "Disable REST API", LiteSpeed cache) must not block `/wp-json/knovix/`.
4. Set `define('KNOVIX_FRONTEND_ORIGIN', 'https://knovixgadgets.in,https://www.knovixgadgets.in');` in wp-config.php.
5. Don't upload `dist/` over the WordPress root: put it on its own domain/subdomain or sub-folder (`VITE_BASE_PATH`).

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

## Shipping changelog (latest)
- Checkout no longer adds a default shipping fee: shipping shows only after State + 6-digit pincode are entered and the backend returns a quote; Place Order stays disabled until then.
- Backend (`knovix-api-bridge`): order route now validates items and prices shipping BEFORE creating the WooCommerce order, uses the real line-item subtotal for the free-shipping check, and records the real shipping method/zone on the order (also when free).
- `/shipping` banner threshold now uses the highest per-zone free-shipping minimum so it never over-promises.
- Optional pincode/state check: add `define('KNOVIX_VALIDATE_PINCODE_STATE', true);` to wp-config.php (off by default).
- Remember: every state zone in WooCommerce > Shipping needs a Free Shipping method with minimum order amount 199 for "free above Rs 199" to hold in that zone.

## Latest update
- Flash sale banner now uses the Knovix peacock mix (deep navy -> brand teal, gold badge) instead of orange/red (`.flash-sale-bg` in `src/index.css`).
- After placing an order: confirmation + thank-you message, then signed-in customers are auto-redirected to My Orders (`/account`) after 6s, with "Go now" / "Stay here". Guests get a "Log in to track" link (`/account` needs login).
- Security: `GET /orders/:id` now requires the order key (returned once at checkout) for guests, so order IDs can't be enumerated to read other customers' details. Logged-in owners and admins are unaffected.
- Fixes: deal countdown showed ~47h after midnight; cart cleared before navigation at checkout; 10-digit phone validation (frontend + backend); COD orders no longer say "Total paid"; leftover purple/old-teal colors replaced with brand colors.
- dist/ was patched by hand to match src/ - run `npm install && npm run build` to regenerate it cleanly.

## Shipping: free-shipping minimum fix
- One shared rule (`knovix_free_shipping_threshold`) now drives both the banner and the real quote/order price. Before, the banner counted "coupon AND min amount" as free but the quote never did.
- The banner no longer invents a default: the hard-coded 199 fallback (plugin constant + frontend) is gone. If WooCommerce has no free-shipping rule, no "free above" promise is shown.
- If the customer's zone has no Free Shipping method but another zone does, the store-wide minimum is now honoured instead of charging the flat fee. Opt out with `define('KNOVIX_STRICT_ZONE_FREE_SHIPPING', true);` in wp-config.php.
- Amount parsing respects WooCommerce separators; `/shipping` and `/shipping/quote` are sent with no-store cache headers.
- Debug: POST `/wp-json/knovix/v1/shipping/quote` with `"debug": true` returns the zone, each method and why it did/didn't qualify.

## Checkout state dropdown
- Address > State is a dropdown of the 28 Indian states: Kerala, Tamil Nadu, Karnataka first, then the rest A-Z (`src/utils/shipping.js`). Union territories (Delhi, Puducherry, etc.) are not listed.
- The value sent is the state name; the backend maps it to the WooCommerce code (case/space-insensitive, Orissa/Odisha and Uttaranchal/Uttarakhand aliases). Order confirmations now show the full state name instead of the code.

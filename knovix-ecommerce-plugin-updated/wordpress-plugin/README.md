# Knovix API Bridge (WordPress plugin)

Turns a WordPress + WooCommerce site into the backend for the Knovix
Gadgets React frontend. Installs a REST API under
`/wp-json/knovix/v1/...` that matches the frontend's contract exactly, so
your WooCommerce Consumer Key/Secret never has to be exposed in the
browser — the plugin runs server-side inside WordPress and calls
WooCommerce's PHP functions directly.

## Requirements
- WordPress with the **WooCommerce** plugin active
- PHP 7.4+

## Install
1. Zip the `knovix-api-bridge` folder, or copy it directly into
   `wp-content/plugins/knovix-api-bridge`.
2. Activate **Knovix API Bridge** under Plugins in wp-admin.
3. (Optional but recommended) In `wp-config.php`, restrict CORS to your
   real frontend domain instead of the `*` default:
   ```php
   define('KNOVIX_FRONTEND_ORIGIN', 'https://yourfrontend.com');
   ```
4. For phone/OTP login, sign up at https://www.fast2sms.com, grab your API
   key from the Dev API dashboard, and add it to `wp-config.php`:
   ```php
   define('KNOVIX_FAST2SMS_API_KEY', 'your-fast2sms-api-key');
   ```
   Without this key, `/auth/otp/request` returns a 500 telling the
   frontend SMS isn't configured yet — everything else keeps working.

## What it adds
| Endpoint | Notes |
|---|---|
| `GET /categories` | from WooCommerce product categories |
| `GET /products` | supports `?category=&search=&sort=` |
| `GET /products/:id` | |
| `POST /products` · `PATCH /products/:id` · `DELETE /products/:id` | admin only (`manage_woocommerce`) |
| `POST /auth/signup`, `/auth/login`, `/auth/logout`, `GET /auth/session` | issues a bearer token stored in WP user meta, no separate JWT plugin needed |
| `POST /auth/otp/request` | body `{ phone }` — sends a 6-digit OTP via Fast2SMS, 45s resend cooldown |
| `POST /auth/otp/verify` | body `{ phone, otp, name? }` — first successful verify for a number creates the account; returns the same `{ token, ... }` shape as `/auth/login` |
| `POST /orders` | creates a real WooCommerce order; works for guests or logged-in customers |
| `GET /orders`, `GET /orders/:id` | customers see only their own orders; admins see all |
| `PATCH /orders/:id/status` | admin only — maps to WooCommerce's order statuses, including a custom **Shipped** status the plugin registers |

## Product fields
The plugin maps the React admin form's fields onto WooCommerce products:
`name`, `description`, `price` (sale price), `mrp` (regular price),
`stock`, `category` (matched by slug), `image` (an external URL is
sideloaded into the media library), `featured`, `bestSeller` (stored as
post meta `_knovix_bestseller` since WooCommerce has no such field
natively).

## Auth model
Login/signup return a `token` alongside the user object. The frontend's
`src/api/client.js` stores it in `localStorage` (`knovix_token`) and sends
it as `Authorization: Bearer <token>` on every request — that's how the
plugin knows who's calling for order history and admin actions.

## Wiring up the frontend
In the main project, each file in `src/api/` has a `USE_WORDPRESS` flag at
the top — flip it to `true` once this plugin is installed and reachable,
and set `VITE_API_BASE_URL` in a `.env` file to your WordPress site's URL.
No other file in the app needs to change.

## Limitations to know about
- Guest order lookups (`GET /orders/:id` right after checkout) are
  intentionally unauthenticated so the order-success page works without
  login — an order that *is* tied to an account is still only visible to
  its owner or an admin.
- This plugin is a starting point, not a security audit: review the
  admin-write endpoints, rate-limit login/signup, and consider swapping
  the custom bearer-token system for a maintained auth plugin if this
  goes into production with real payments.

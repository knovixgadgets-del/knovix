<?php
/**
 * Plugin Name: Knovix API Bridge
 * Description: Exposes a small REST API (under /wp-json/knovix/v1) that maps
 *              1:1 to the Knovix Gadgets React frontend's API contract, and
 *              proxies it to WooCommerce internally. Consumer keys never
 *              leave the server — the frontend only ever talks to this
 *              plugin's endpoints.
 * Version:     1.0.0
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) exit;

define('KNOVIX_API_NS', 'knovix/v1');

require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/products.php';
require_once __DIR__ . '/includes/orders.php';

// Let a Bearer token from our own auth system set the current WP user for
// every request (so current_user_can() works normally in each handler).
add_filter('determine_current_user', 'knovix_authenticate_bearer_token', 20);

add_action('rest_api_init', function () {
    knovix_register_auth_routes();
    knovix_register_product_routes();
    knovix_register_order_routes();
});

// WooCommerce ships with pending/processing/on-hold/completed/cancelled/
// refunded/failed — none of which is "Shipped", so register it as a real
// order status the admin dropdown (both wp-admin and the React admin panel)
// can set orders to.
add_action('init', function () {
    register_post_status('wc-shipped', [
        'label'                     => 'Shipped',
        'public'                    => true,
        'exclude_from_search'       => false,
        'show_in_admin_all_list'    => true,
        'show_in_admin_status_list' => true,
        'label_count'               => _n_noop('Shipped <span class="count">(%s)</span>', 'Shipped <span class="count">(%s)</span>')
    ]);
});
add_filter('wc_order_statuses', function ($statuses) {
    $new = [];
    foreach ($statuses as $key => $label) {
        $new[$key] = $label;
        if ($key === 'wc-processing') $new['wc-shipped'] = 'Shipped';
    }
    return $new;
});

// CORS — restrict this to your real frontend origin before going live by
// defining KNOVIX_FRONTEND_ORIGIN (e.g. in wp-config.php):
//   define('KNOVIX_FRONTEND_ORIGIN', 'https://yourdomain.com');
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $allowed_origin = defined('KNOVIX_FRONTEND_ORIGIN') ? KNOVIX_FRONTEND_ORIGIN : '*';
        header('Access-Control-Allow-Origin: ' . $allowed_origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        // Browsers reject "Allow-Origin: *" combined with "Allow-Credentials: true"
        // outright (the request fails CORS preflight with no usable error message,
        // which looked like "products won't load"). This app authenticates with a
        // Bearer token, not cookies, so credentials mode is never actually needed —
        // only send this header when a specific origin has been configured.
        if ($allowed_origin !== '*') {
            header('Access-Control-Allow-Credentials: true');
        }
        return $value;
    });
}, 15);

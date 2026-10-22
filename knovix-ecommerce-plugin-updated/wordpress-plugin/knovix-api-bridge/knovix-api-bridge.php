<?php
/**
 * Plugin Name: Knovix API Bridge
 * Description: REST API bridge between the Knovix React frontend and WooCommerce.
 * Version: 1.0.0
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) {
    exit;
}

/*
|--------------------------------------------------------------------------
| API Namespace
|--------------------------------------------------------------------------
*/

define('KNOVIX_API_NS', 'knovix/v1');
// KNOVIX_FREE_SHIPPING_MIN was removed: the free-shipping minimum now comes only from
// WooCommerce > Settings > Shipping (Free shipping > Minimum order amount).
define('KNOVIX_SHIPPING_FEE', 49);


/*
|--------------------------------------------------------------------------
| Load API files
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/otp-auth.php';
require_once __DIR__ . '/includes/products.php';
require_once __DIR__ . '/includes/orders.php';


/*
|--------------------------------------------------------------------------
| Bearer Authentication
|--------------------------------------------------------------------------
|
| This allows:
|
| Authorization: Bearer YOUR_TOKEN
|
| to identify the current WordPress user.
|
*/

add_filter(
    'determine_current_user',
    'knovix_authenticate_bearer_token',
    20
);


/*
|--------------------------------------------------------------------------
| Register REST Routes
|--------------------------------------------------------------------------
*/

add_action('rest_api_init', function () {

    /*
     * Health check - open  https://YOUR-WP-SITE/wp-json/knovix/v1/health
     * in a browser. {"ok":true,...} means the plugin is installed, active and
     * reachable; anything else (HTML page, 404, redirect) means the frontend's
     * VITE_API_BASE_URL is pointing at the wrong place or the plugin is off.
     */
    register_rest_route(KNOVIX_API_NS, '/health', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            $res = rest_ensure_response([
                'ok'          => true,
                'plugin'      => 'knovix-api-bridge',
                'woocommerce' => function_exists('wc_get_products'),
                'site'        => home_url(),
            ]);
            $res->header('Cache-Control', 'no-store, max-age=0');
            return $res;
        },
    ]);

    /*
     * Without WooCommerce every handler below would hit an undefined function
     * (wc_get_products, wc_get_product ...) and die with a fatal 500 / empty
     * response. Answer with a clear JSON error instead.
     */
    if (!function_exists('wc_get_products') || !function_exists('WC')) {
        register_rest_route(KNOVIX_API_NS, '/(?P<knovix_any>.+)', [
            'methods'  => 'GET, POST, PUT, PATCH, DELETE',
            'permission_callback' => '__return_true',
            'callback' => function () {
                return knovix_error('The store is temporarily unavailable (WooCommerce is not active).', 503);
            },
        ]);
        return;
    }

    knovix_register_auth_routes();

    knovix_register_otp_routes();

    knovix_register_product_routes();

    knovix_register_order_routes();

});


/*
|--------------------------------------------------------------------------
| WooCommerce "Shipped" Order Status
|--------------------------------------------------------------------------
*/

add_action('init', function () {

    register_post_status('wc-shipped', [
        'label'                     => 'Shipped',
        'public'                    => true,
        'exclude_from_search'       => false,
        'show_in_admin_all_list'    => true,
        'show_in_admin_status_list' => true,

        'label_count' => _n_noop(
            'Shipped <span class="count">(%s)</span>',
            'Shipped <span class="count">(%s)</span>'
        ),
    ]);

});


/*
|--------------------------------------------------------------------------
| Add "Shipped" to WooCommerce order statuses
|--------------------------------------------------------------------------
*/

add_filter('wc_order_statuses', function ($statuses) {

    $new_statuses = [];

    foreach ($statuses as $key => $label) {

        $new_statuses[$key] = $label;

        if ($key === 'wc-processing') {
            $new_statuses['wc-shipped'] = 'Shipped';
        }
    }

    return $new_statuses;

});


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| LOCAL DEVELOPMENT
|
| Add this to wp-config.php:
|
| define(
|     'KNOVIX_FRONTEND_ORIGIN',
|     'http://localhost:5173'
| );
|
| For production, set this to the permanent frontend domain:
|
| define(
|     'KNOVIX_FRONTEND_ORIGIN',
|     'https://knovixgadgets.in'
| );
|
|--------------------------------------------------------------------------
*/

/**
 * Which browser origins may call the API.
 *
 *   define('KNOVIX_FRONTEND_ORIGIN', 'https://knovixgadgets.in');
 *   // several (comma separated) - e.g. www + non-www + local dev:
 *   define('KNOVIX_FRONTEND_ORIGIN', 'https://knovixgadgets.in,https://www.knovixgadgets.in,http://localhost:5173');
 *
 * If it is not defined every origin is allowed ('*'), which is fine for a public
 * read API because auth is a bearer token, not cookies.
 */
function knovix_allowed_origins() {
    if (!defined('KNOVIX_FRONTEND_ORIGIN') || !KNOVIX_FRONTEND_ORIGIN) return ['*'];
    $list = array_map(function ($o) { return rtrim(trim($o), '/'); }, explode(',', (string) KNOVIX_FRONTEND_ORIGIN));
    return array_values(array_filter($list));
}

function knovix_send_cors_headers() {
    if (headers_sent()) return;

    $allowed = knovix_allowed_origins();
    $origin  = isset($_SERVER['HTTP_ORIGIN']) ? rtrim((string) $_SERVER['HTTP_ORIGIN'], '/') : '';

    if (in_array('*', $allowed, true)) {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin !== '' && in_array($origin, $allowed, true)) {
        // Echo back the matching origin (a browser rejects a list or a trailing slash).
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin', false);
        header('Access-Control-Allow-Credentials: true');
    } else {
        return; // unknown origin: send no CORS headers at all
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Knovix-Token');
    header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');
    header('Access-Control-Max-Age: 86400');
}

add_action('rest_api_init', function () {

    // Replace WordPress's own CORS handler (it only allows the site's own origin
    // and cannot be configured for a separate frontend domain).
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function ($served) {
        knovix_send_cors_headers();
        return $served;
    }, 15);

}, 15);

/*
 * Answer CORS preflight (OPTIONS) requests ourselves, before WordPress routing,
 * so they always get a clean 204 with the headers above - even on hosts/security
 * plugins that would otherwise turn the OPTIONS request into a 404/403 (which
 * makes the browser block the real request and the storefront shows nothing).
 */
add_action('init', function () {
    if (
        isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
        && isset($_SERVER['REQUEST_URI'])
        && (
            strpos((string) $_SERVER['REQUEST_URI'], '/wp-json/' . KNOVIX_API_NS) !== false
            // plain-permalink form: /index.php?rest_route=/knovix/v1/...
            || strpos(rawurldecode((string) $_SERVER['REQUEST_URI']), 'rest_route=/' . KNOVIX_API_NS) !== false
        )
    ) {
        knovix_send_cors_headers();
        status_header(204);
        exit;
    }
}, 1);

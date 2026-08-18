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


/*
|--------------------------------------------------------------------------
| Load API files
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/auth.php';
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

    knovix_register_auth_routes();

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
| KNOVIX CORS
|--------------------------------------------------------------------------
|
| Allows the React frontend to communicate with the WordPress REST API.
|
| Local:
|   http://localhost:5173
|   http://localhost:5174
|
| Production:
|   Replace YOUR-LIVE-REACT-DOMAIN.com below.
|
|--------------------------------------------------------------------------
*/


/*
 * Remove WordPress default REST CORS handling.
 */
add_action('rest_api_init', function () {

    remove_filter(
        'rest_pre_serve_request',
        'rest_send_cors_headers'
    );

}, 5);


/*
 * Add Knovix CORS headers.
 */
add_filter(
    'rest_pre_serve_request',
    function ($served, $result, $request, $server) {

        /*
         * Get requesting frontend origin.
         */
        $origin = get_http_origin();


        /*
         * Allowed frontend origins.
         */
        $allowed_origins = [

            // Local Vite development
            'http://localhost:5173',
            'http://localhost:5174',

            // Production React frontend
            'https://cornflowerblue-ibis-801817.hostingersite.com',

        ];


        /*
         * Only allow known origins.
         */
        if (
            $origin &&
            in_array($origin, $allowed_origins, true)
        ) {

            header(
                'Access-Control-Allow-Origin: ' . $origin
            );

            header(
                'Vary: Origin'
            );

            header(
                'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS'
            );

            header(
                'Access-Control-Allow-Headers: Content-Type, Authorization'
            );

            header(
                'Access-Control-Allow-Credentials: true'
            );

            header(
                'Access-Control-Max-Age: 86400'
            );
        }


        return $served;

    },
    15,
    4
);


/*
|--------------------------------------------------------------------------
| Handle CORS Preflight Requests
|--------------------------------------------------------------------------
|
| Browsers may send an OPTIONS request before POST/PATCH/DELETE
| requests or requests containing Authorization headers.
|
|--------------------------------------------------------------------------
*/

add_action('init', function () {

    if (
        isset($_SERVER['REQUEST_METHOD']) &&
        strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS'
    ) {

        $origin = get_http_origin();


        $allowed_origins = [

            // Local Vite development
            'http://localhost:5173',
            'http://localhost:5174',

            // Production React frontend
            'https://cornflowerblue-ibis-801817.hostingersite.com',

        ];


        /*
         * Only send CORS headers for approved origins.
         */
        if (
            $origin &&
            in_array($origin, $allowed_origins, true)
        ) {

            header(
                'Access-Control-Allow-Origin: ' . $origin
            );

            header(
                'Vary: Origin'
            );

            header(
                'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS'
            );

            header(
                'Access-Control-Allow-Headers: Content-Type, Authorization'
            );

            header(
                'Access-Control-Allow-Credentials: true'
            );

            header(
                'Access-Control-Max-Age: 86400'
            );

            status_header(204);

            exit;
        }
    }

});
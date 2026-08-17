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
| For production change it to your real React domain.
|
|--------------------------------------------------------------------------
*/

add_action('rest_api_init', function () {

    /*
     * Remove WordPress default CORS headers.
     */
    remove_filter(
        'rest_pre_serve_request',
        'rest_send_cors_headers'
    );


    /*
     * Add Knovix CORS headers.
     */
    add_filter(
        'rest_pre_serve_request',
        function ($served) {

            $allowed_origin = defined('KNOVIX_FRONTEND_ORIGIN')
                ? KNOVIX_FRONTEND_ORIGIN
                : '*';


            /*
             * Allow frontend origin.
             */
            header(
                'Access-Control-Allow-Origin: ' .
                $allowed_origin
            );


            /*
             * HTTP methods used by React.
             */
            header(
                'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS'
            );


            /*
             * Headers used by React.
             */
            header(
                'Access-Control-Allow-Headers: Content-Type, Authorization'
            );


            /*
             * Credentials are only needed when using a specific
             * origin. Your Bearer-token authentication does not
             * depend on WordPress cookies.
             */
            if ($allowed_origin !== '*') {

                header(
                    'Access-Control-Allow-Credentials: true'
                );
            }


            /*
             * Cache preflight response.
             */
            header(
                'Access-Control-Max-Age: 86400'
            );


            return $served;

        },
        15
    );

});
<?php

if (!defined('ABSPATH')) {
    exit;
}


/*
|--------------------------------------------------------------------------
| Register Product Routes
|--------------------------------------------------------------------------
*/

function knovix_register_product_routes()
{

    /*
    |--------------------------------------------------------------------------
    | GET CATEGORIES
    |--------------------------------------------------------------------------
    |
    | GET /wp-json/knovix/v1/categories
    |
    */

    register_rest_route(KNOVIX_API_NS, '/categories', [

        'methods' => WP_REST_Server::READABLE,

        'permission_callback' => 'knovix_public_permission',

        'callback' => function () {

            $terms = get_terms([
                'taxonomy'   => 'product_cat',
                'hide_empty' => false,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]);


            if (is_wp_error($terms)) {
                return [];
            }


            $categories = [];


            foreach ($terms as $term) {

                /*
                 * Remove WooCommerce default category.
                 */
                if ($term->slug === 'uncategorized') {
                    continue;
                }


                /*
                 * Get category image.
                 */
                $thumbnail_id = get_term_meta(
                    $term->term_id,
                    'thumbnail_id',
                    true
                );


                $image = '';

                if ($thumbnail_id) {

                    $image_url = wp_get_attachment_image_url(
                        $thumbnail_id,
                        'medium'
                    );

                    if ($image_url) {
                        $image = $image_url;
                    }
                }


                $categories[] = [
                    'id'    => $term->slug,
                    'name'  => $term->name,
                    'image' => $image,
                    'count' => (int) $term->count,
                    'parent' => $term->parent ? (int) $term->parent : 0,
                ];
            }


            return array_values($categories);
        },

    ]);


    /*
    |--------------------------------------------------------------------------
    | GET PRODUCTS
    |--------------------------------------------------------------------------
    |
    | GET /wp-json/knovix/v1/products
    |
    */

    register_rest_route(KNOVIX_API_NS, '/products', [

        'methods' => WP_REST_Server::READABLE,

        'permission_callback' => 'knovix_public_permission',

        'callback' => function (WP_REST_Request $request) {

            /*
             * Default WooCommerce query.
             */
            $args = [

                'status' => 'publish',

                /*
                 * The storefront has no pagination, so fetch the whole
                 * catalogue (capped for safety). It used to be a hard 24,
                 * which silently hid every product after the 24th. The
                 * client's ?limit=N is applied AFTER search/sort below, so
                 * "cheapest 8" really is the 8 cheapest.
                 */
                'limit' => 500,

                'return' => 'objects',

            ];


            /*
            |--------------------------------------------------------------------------
            | Category
            |--------------------------------------------------------------------------
            */

            $category = $request->get_param('category');

            if ($category !== null && $category !== '') {

                $args['category'] = [
                    sanitize_title($category),
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Sorting
            |--------------------------------------------------------------------------
            |
            | price / rating are sorted in PHP below: wc_get_products() does not
            | reliably honour orderby=price|rating, so the old "Price: low to high"
            | option returned the unsorted list.
            */

            $sort = (string) $request->get_param('sort');

            $args['orderby'] = 'date';
            $args['order']   = 'DESC';


            /*
            |--------------------------------------------------------------------------
            | Fetch WooCommerce products
            |--------------------------------------------------------------------------
            */

            $products = wc_get_products($args);

            if (!is_array($products)) {
                $products = [];
            }


            /*
            |--------------------------------------------------------------------------
            | Search (name, SKU, descriptions, category)
            |--------------------------------------------------------------------------
            */

            $search = trim((string) $request->get_param('search'));

            if ($search !== '') {

                $needle = function_exists('mb_strtolower') ? mb_strtolower($search) : strtolower($search);

                $products = array_values(array_filter($products, function ($p) use ($needle) {

                    $hay = $p->get_name() . ' ' . $p->get_sku() . ' ' . $p->get_short_description() . ' ' . $p->get_description();

                    $terms = get_the_terms($p->get_id(), 'product_cat');
                    if ($terms && !is_wp_error($terms)) {
                        foreach ($terms as $t) $hay .= ' ' . $t->name;
                    }

                    $hay = function_exists('mb_strtolower') ? mb_strtolower($hay) : strtolower($hay);

                    return strpos($hay, $needle) !== false;
                }));
            }


            /*
            |--------------------------------------------------------------------------
            | Hide products the owner set to "Hidden" catalogue visibility
            |--------------------------------------------------------------------------
            */

            $products = array_values(array_filter($products, function ($p) {
                return $p->get_catalog_visibility() !== 'hidden';
            }));


            /*
            |--------------------------------------------------------------------------
            | Sort
            |--------------------------------------------------------------------------
            */

            if ($sort === 'price_asc') {
                usort($products, function ($a, $b) { return (float) $a->get_price() <=> (float) $b->get_price(); });
            } elseif ($sort === 'price_desc') {
                usort($products, function ($a, $b) { return (float) $b->get_price() <=> (float) $a->get_price(); });
            } elseif ($sort === 'rating') {
                usort($products, function ($a, $b) {
                    $c = (float) $b->get_average_rating() <=> (float) $a->get_average_rating();
                    return $c !== 0 ? $c : ((int) $b->get_review_count() <=> (int) $a->get_review_count());
                });
            }


            $limit = (int) $request->get_param('limit');

            if ($limit > 0) {
                $products = array_slice($products, 0, min(500, $limit));
            }


            /*
            |--------------------------------------------------------------------------
            | Format for React
            |--------------------------------------------------------------------------
            */

            $result = [];

            foreach ($products as $product) {

                $result[] = knovix_format_product($product);
            }


            return $result;
        },

    ]);


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE PRODUCT
    |--------------------------------------------------------------------------
    |
    | GET /wp-json/knovix/v1/products/123
    |
    */

    register_rest_route(
        KNOVIX_API_NS,
        '/products/(?P<id>\d+)',
        [

            'methods' => WP_REST_Server::READABLE,

            'permission_callback' => 'knovix_public_permission',

            'callback' => function (WP_REST_Request $request) {

                $product_id = absint(
                    $request->get_param('id')
                );


                $product = wc_get_product($product_id);


                // Drafts / private / trashed products must not be readable by the public.
                if (
                    !$product ||
                    ($product->get_status() !== 'publish' && !current_user_can('manage_woocommerce'))
                ) {

                    return knovix_error(
                        'Product not found',
                        404
                    );
                }


                return knovix_format_product($product);
            },

        ]
    );


    /*
    |--------------------------------------------------------------------------
    | CREATE PRODUCT
    |--------------------------------------------------------------------------
    |
    | POST /wp-json/knovix/v1/products
    |
    */

    register_rest_route(KNOVIX_API_NS, '/products', [

        'methods' => WP_REST_Server::CREATABLE,

        'permission_callback' => 'knovix_require_admin',

        'callback' => function (WP_REST_Request $request) {

            $product = new WC_Product_Simple();


            /*
             * Apply request fields.
             */
            knovix_apply_product_fields(
                $product,
                $request
            );


            /*
             * Save product.
             */
            $product->save();


            /*
             * Save custom bestseller value.
             */
            knovix_save_bestseller_meta(
                $product,
                $request
            );


            return knovix_format_product($product);
        },

    ]);


    /*
    |--------------------------------------------------------------------------
    | UPDATE PRODUCT
    |--------------------------------------------------------------------------
    |
    | PUT/PATCH /wp-json/knovix/v1/products/123
    |
    */

    register_rest_route(
        KNOVIX_API_NS,
        '/products/(?P<id>\d+)',
        [

            // Must be a plain string. As an array holding one \"POST, PUT, PATCH\" string
            // WordPress treated it as ONE method name that no request can match, so
            // editing a product from the admin panel returned rest_no_route.
            'methods' => WP_REST_Server::EDITABLE,

            'permission_callback' => 'knovix_require_admin',

            'callback' => function (WP_REST_Request $request) {

                $product_id = absint(
                    $request->get_param('id')
                );


                $product = wc_get_product($product_id);


                if (!$product) {

                    return knovix_error(
                        'Product not found',
                        404
                    );
                }


                /*
                 * Apply changed fields.
                 */
                knovix_apply_product_fields(
                    $product,
                    $request
                );


                /*
                 * Save.
                 */
                $product->save();


                /*
                 * Save bestseller meta.
                 */
                knovix_save_bestseller_meta(
                    $product,
                    $request
                );


                return knovix_format_product($product);
            },

        ]
    );


    /*
    |--------------------------------------------------------------------------
    | DELETE PRODUCT
    |--------------------------------------------------------------------------
    |
    | DELETE /wp-json/knovix/v1/products/123
    |
    */

    register_rest_route(
        KNOVIX_API_NS,
        '/products/(?P<id>\d+)',
        [

            'methods' => WP_REST_Server::DELETABLE,

            'permission_callback' => 'knovix_require_admin',

            'callback' => function (WP_REST_Request $request) {

                $product_id = absint(
                    $request->get_param('id')
                );


                $product = wc_get_product($product_id);


                if (!$product) {

                    return knovix_error(
                        'Product not found',
                        404
                    );
                }


                /*
                 * Permanently delete product.
                 */
                $product->delete(true);


                return [
                    'success' => true,
                    'id'      => $product_id,
                ];
            },

        ]
    );

}


/*
|--------------------------------------------------------------------------
| Apply Product Fields
|--------------------------------------------------------------------------
*/

function knovix_apply_product_fields(
    WC_Product $product,
    WP_REST_Request $request
) {

    /*
    |--------------------------------------------------------------------------
    | NAME
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('name') !== null) {

        $product->set_name(
            sanitize_text_field(
                $request->get_param('name')
            )
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('description') !== null) {

        $product->set_description(
            wp_kses_post(
                $request->get_param('description')
            )
        );
    }


    /*
    |--------------------------------------------------------------------------
    | SHORT DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('shortDescription') !== null) {

        $product->set_short_description(
            wp_kses_post(
                $request->get_param('shortDescription')
            )
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PRICE / MRP
    |--------------------------------------------------------------------------
    |
    | React:
    |
    | mrp   = original price
    | price = selling price
    |
    | Example:
    |
    | mrp   = 999
    | price = 799
    |
    | WooCommerce:
    |
    | regular_price = 999
    | sale_price    = 799
    |
    */

    $price = $request->get_param('price');
    $mrp   = $request->get_param('mrp');


    if ($mrp !== null && $mrp !== '') {

        $mrp_value = wc_format_decimal($mrp);

        $product->set_regular_price(
            $mrp_value
        );
    }


    if ($price !== null && $price !== '') {

        $price_value = wc_format_decimal($price);

        /*
         * If MRP exists and selling price is lower,
         * use WooCommerce sale price.
         */
        if (
            $mrp !== null &&
            $mrp !== '' &&
            (float) $price < (float) $mrp
        ) {

            $product->set_sale_price(
                $price_value
            );

        } else {

            /*
             * No discount.
             */
            $product->set_regular_price(
                $price_value
            );

            $product->set_sale_price('');
        }
    }


    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('stock') !== null) {

        $stock = absint(
            $request->get_param('stock')
        );


        $product->set_manage_stock(true);

        $product->set_stock_quantity($stock);


        if ($stock > 0) {

            $product->set_stock_status(
                'instock'
            );

        } else {

            $product->set_stock_status(
                'outofstock'
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | FEATURED
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('featured') !== null) {

        $featured = filter_var(
            $request->get_param('featured'),
            FILTER_VALIDATE_BOOLEAN
        );


        $product->set_featured(
            $featured
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('category') !== null) {

        $category_slug = sanitize_title(
            $request->get_param('category')
        );


        $term = get_term_by(
            'slug',
            $category_slug,
            'product_cat'
        );


        if ($term && !is_wp_error($term)) {

            $product->set_category_ids([
                (int) $term->term_id,
            ]);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PRODUCT IMAGE
    |--------------------------------------------------------------------------
    */

    if ($request->get_param('image') !== null) {

        $image_url = esc_url_raw(
            $request->get_param('image')
        );

        /*
         * The admin form always re-sends the current image URL on edit. Only
         * download it when it is a NEW external URL - otherwise every save
         * would add another copy to the media library (and fail outright if
         * the image is a localhost/private URL).
         */
        $current_url = $product->get_image_id()
            ? wp_get_attachment_image_url($product->get_image_id(), 'large')
            : '';

        $uploads = wp_get_upload_dir();
        $is_local = !empty($uploads['baseurl'])
            && strpos((string) $image_url, (string) $uploads['baseurl']) === 0;

        if (
            $image_url &&
            $image_url !== $current_url &&
            !$is_local &&
            strpos((string) $image_url, 'placeholder') === false
        ) {
            $attachment_id =
                knovix_sideload_image_if_url(
                    $image_url
                );

            if ($attachment_id) {
                $product->set_image_id(
                    $attachment_id
                );
            }
        } elseif ($is_local && $image_url !== $current_url) {
            // An image already in this site's media library: reuse it.
            $existing = attachment_url_to_postid($image_url);
            if ($existing) {
                $product->set_image_id($existing);
            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Product status
    |--------------------------------------------------------------------------
    */

    // New products go live immediately; editing must not re-publish a product
    // the owner deliberately set to draft/private in wp-admin.
    if (!$product->get_id()) {
        $product->set_status('publish');
    }
}


/*
|--------------------------------------------------------------------------
| Save Best Seller Meta
|--------------------------------------------------------------------------
|
| WooCommerce doesn't have a native "best seller" boolean.
|
| We store:
|
| _knovix_bestseller = yes/no
|
*/

function knovix_save_bestseller_meta(
    WC_Product $product,
    WP_REST_Request $request
) {

    if ($request->get_param('bestSeller') === null) {
        return;
    }


    $best_seller = filter_var(
        $request->get_param('bestSeller'),
        FILTER_VALIDATE_BOOLEAN
    );


    update_post_meta(
        $product->get_id(),
        '_knovix_bestseller',
        $best_seller ? 'yes' : 'no'
    );
}


/*
|--------------------------------------------------------------------------
| Sideload External Image
|--------------------------------------------------------------------------
*/

function knovix_sideload_image_if_url($url)
{

    if (
        !$url ||
        !filter_var(
            $url,
            FILTER_VALIDATE_URL
        )
    ) {

        return null;
    }


    /*
     * WordPress media functions.
     */
    require_once ABSPATH .
        'wp-admin/includes/media.php';

    require_once ABSPATH .
        'wp-admin/includes/file.php';

    require_once ABSPATH .
        'wp-admin/includes/image.php';


    /*
     * Download image into WordPress Media Library.
     */
    $attachment_id = media_sideload_image(
        $url,
        0,
        null,
        'id'
    );


    if (is_wp_error($attachment_id)) {

        return null;
    }


    return (int) $attachment_id;
}
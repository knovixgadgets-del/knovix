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

                'limit' => 24,

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
            | Search
            |--------------------------------------------------------------------------
            */

            $search = $request->get_param('search');

            if ($search !== null && $search !== '') {

                $args['s'] = sanitize_text_field($search);
            }


            /*
            |--------------------------------------------------------------------------
            | Sorting
            |--------------------------------------------------------------------------
            */

            $sort = $request->get_param('sort');

            switch ($sort) {

                case 'price_asc':

                    $args['orderby'] = 'price';
                    $args['order']   = 'ASC';

                    break;


                case 'price_desc':

                    $args['orderby'] = 'price';
                    $args['order']   = 'DESC';

                    break;


                case 'rating':

                    $args['orderby'] = 'rating';
                    $args['order']   = 'DESC';

                    break;


                case 'newest':

                    $args['orderby'] = 'date';
                    $args['order']   = 'DESC';

                    break;


                default:

                    /*
                     * WooCommerce default.
                     */
                    $args['orderby'] = 'date';
                    $args['order']   = 'DESC';

                    break;
            }


            /*
            |--------------------------------------------------------------------------
            | Fetch WooCommerce products
            |--------------------------------------------------------------------------
            */

            $products = wc_get_products($args);


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


                if (!$product) {

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

            'methods' => [
                WP_REST_Server::EDITABLE,
            ],

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


        $attachment_id =
            knovix_sideload_image_if_url(
                $image_url
            );


        if ($attachment_id) {

            $product->set_image_id(
                $attachment_id
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PRODUCT IMAGE GALLERY
    |--------------------------------------------------------------------------
    |
    | React sends `images`: an array of URLs. The first URL is treated as
    | the main image (mirrors `image` above if both are sent); any
    | additional URLs become the WooCommerce gallery.
    |
    */

    if ($request->get_param('images') !== null) {

        $image_urls = (array) $request->get_param('images');

        $gallery_ids = [];

        foreach ($image_urls as $i => $url) {

            $url = esc_url_raw($url);

            $attachment_id = knovix_sideload_image_if_url($url);

            if (!$attachment_id) {
                continue;
            }

            if ($i === 0 && $request->get_param('image') === null) {
                $product->set_image_id($attachment_id);
            } else {
                $gallery_ids[] = $attachment_id;
            }
        }

        if (!empty($gallery_ids)) {
            $product->set_gallery_image_ids($gallery_ids);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Product status
    |--------------------------------------------------------------------------
    */

    $product->set_status('publish');
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
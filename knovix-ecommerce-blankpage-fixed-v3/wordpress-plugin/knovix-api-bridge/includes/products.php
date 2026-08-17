<?php
if (!defined('ABSPATH')) exit;

function knovix_register_product_routes() {

    /* =========================================================
       GET PRODUCT CATEGORIES
       ========================================================= */

    register_rest_route(KNOVIX_API_NS, '/categories', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',

        'callback' => function () {

            $terms = get_terms([
                'taxonomy'   => 'product_cat',
                'hide_empty' => false
            ]);

            if (is_wp_error($terms)) {
                return [];
            }

            return array_values(
                array_filter(
                    array_map(function ($t) {

                        // Remove WooCommerce Uncategorized category
                        if ($t->slug === 'uncategorized') {
                            return null;
                        }

                        $thumb_id = get_term_meta(
                            $t->term_id,
                            'thumbnail_id',
                            true
                        );

                        return [
                            'id'    => $t->slug,
                            'name'  => $t->name,
                            'image' => $thumb_id
                                ? wp_get_attachment_image_url(
                                    $thumb_id,
                                    'medium'
                                )
                                : ''
                        ];

                    }, $terms)
                )
            );
        }
    ]);


    /* =========================================================
       GET PRODUCTS
       Optimized: 24 products per request instead of 100
       ========================================================= */

    register_rest_route(KNOVIX_API_NS, '/products', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',

        'callback' => function (WP_REST_Request $req) {

            /*
             * IMPORTANT:
             * Previously this was:
             *
             * 'limit' => 100
             *
             * Now we load only 24 products initially.
             */

            $args = [
                'status' => 'publish',
                'limit'  => 24,
                'return' => 'objects'
            ];


            /* =================================================
               CATEGORY FILTER
               ================================================= */

            if ($category = $req->get_param('category')) {

                $args['category'] = [
                    sanitize_title($category)
                ];
            }


            /* =================================================
               SEARCH
               ================================================= */

            if ($search = $req->get_param('search')) {

                $args['s'] = sanitize_text_field($search);
            }


            /* =================================================
               SORTING
               ================================================= */

            switch ($req->get_param('sort')) {

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
            }


            /* =================================================
               GET WOOCOMMERCE PRODUCTS
               ================================================= */

            $products = wc_get_products($args);


            /* =================================================
               FORMAT PRODUCTS FOR REACT FRONTEND
               ================================================= */

            return array_map(
                'knovix_format_product',
                $products
            );
        }
    ]);


    /* =========================================================
       GET SINGLE PRODUCT
       GET /products/{id}
       ========================================================= */

    register_rest_route(KNOVIX_API_NS, '/products/(?P<id>\d+)', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',

        'callback' => function (WP_REST_Request $req) {

            $product = wc_get_product(
                (int) $req['id']
            );

            if (!$product) {

                return knovix_error(
                    'Product not found',
                    404
                );
            }

            return knovix_format_product($product);
        }
    ]);


    /* =========================================================
       CREATE PRODUCT
       ADMIN ONLY
       POST /products
       ========================================================= */

    register_rest_route(KNOVIX_API_NS, '/products', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_require_admin',

        'callback' => function (WP_REST_Request $req) {

            $product = new WC_Product_Simple();

            knovix_apply_product_fields(
                $product,
                $req
            );

            $product->save();

            return knovix_format_product($product);
        }
    ]);


    /* =========================================================
       UPDATE PRODUCT
       ADMIN ONLY
       PATCH /products/{id}
       PUT /products/{id}
       ========================================================= */

    register_rest_route(KNOVIX_API_NS, '/products/(?P<id>\d+)', [
        'methods'  => ['PATCH', 'PUT'],
        'permission_callback' => 'knovix_require_admin',

        'callback' => function (WP_REST_Request $req) {

            $product = wc_get_product(
                (int) $req['id']
            );

            if (!$product) {

                return knovix_error(
                    'Product not found',
                    404
                );
            }

            knovix_apply_product_fields(
                $product,
                $req
            );

            $product->save();

            return knovix_format_product($product);
        }
    ]);


    /* =========================================================
       DELETE PRODUCT
       ADMIN ONLY
       DELETE /products/{id}
       ========================================================= */

    register_rest_route(KNOVIX_API_NS, '/products/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'permission_callback' => 'knovix_require_admin',

        'callback' => function (WP_REST_Request $req) {

            $product = wc_get_product(
                (int) $req['id']
            );

            if (!$product) {

                return knovix_error(
                    'Product not found',
                    404
                );
            }

            $product->delete(true);

            return [
                'success' => true
            ];
        }
    ]);
}


/* =============================================================
   APPLY PRODUCT FORM DATA
   ============================================================= */

function knovix_apply_product_fields(
    $product,
    WP_REST_Request $req
) {

    /* ---------------------------------------------------------
       PRODUCT NAME
       --------------------------------------------------------- */

    if ($req->get_param('name') !== null) {

        $product->set_name(
            sanitize_text_field(
                $req->get_param('name')
            )
        );
    }


    /* ---------------------------------------------------------
       DESCRIPTION
       --------------------------------------------------------- */

    if ($req->get_param('description') !== null) {

        $product->set_description(
            wp_kses_post(
                $req->get_param('description')
            )
        );
    }


    /* ---------------------------------------------------------
       PRICE
       --------------------------------------------------------- */

    if ($req->get_param('price') !== null) {

        $product->set_regular_price(
            (string) $req->get_param('price')
        );
    }


    /* ---------------------------------------------------------
       MRP
       --------------------------------------------------------- */

    if ($req->get_param('mrp') !== null) {

        $product->set_regular_price(
            (string) $req->get_param('mrp')
        );
    }


    /* ---------------------------------------------------------
       SALE PRICE
       --------------------------------------------------------- */

    if (
        $req->get_param('price') !== null &&
        $req->get_param('mrp') !== null &&
        (float) $req->get_param('price') <
        (float) $req->get_param('mrp')
    ) {

        $product->set_sale_price(
            (string) $req->get_param('price')
        );
    }


    /* ---------------------------------------------------------
       STOCK
       --------------------------------------------------------- */

    if ($req->get_param('stock') !== null) {

        $stock = (int) $req->get_param('stock');

        $product->set_manage_stock(true);

        $product->set_stock_quantity($stock);

        $product->set_stock_status(
            $stock > 0
                ? 'instock'
                : 'outofstock'
        );
    }


    /* ---------------------------------------------------------
       FEATURED PRODUCT
       --------------------------------------------------------- */

    if ($req->get_param('featured') !== null) {

        $product->set_featured(
            (bool) $req->get_param('featured')
        );
    }


    /* ---------------------------------------------------------
       CATEGORY
       --------------------------------------------------------- */

    if ($req->get_param('category') !== null) {

        $term = get_term_by(
            'slug',
            sanitize_title(
                $req->get_param('category')
            ),
            'product_cat'
        );

        if ($term) {

            $product->set_category_ids([
                $term->term_id
            ]);
        }
    }


    /* ---------------------------------------------------------
       PRODUCT IMAGE
       --------------------------------------------------------- */

    if ($req->get_param('image') !== null) {

        $attach_id =
            knovix_sideload_image_if_url(
                $req->get_param('image')
            );

        if ($attach_id) {

            $product->set_image_id(
                $attach_id
            );
        }
    }


    /* ---------------------------------------------------------
       BEST SELLER
       --------------------------------------------------------- */

    if ($req->get_param('bestSeller') !== null) {

        /*
         * WooCommerce doesn't have a native setter for this
         * custom Knovix meta value.
         */

        add_action(
            'woocommerce_after_product_object_save',
            function ($p) use ($req) {

                update_post_meta(
                    $p->get_id(),
                    '_knovix_bestseller',
                    $req->get_param('bestSeller')
                        ? 'yes'
                        : 'no'
                );
            },
            10,
            1
        );
    }


    /* ---------------------------------------------------------
       PRODUCT STATUS
       --------------------------------------------------------- */

    $product->set_status('publish');
}


/* =============================================================
   IMPORT EXTERNAL IMAGE URL
   ============================================================= */

function knovix_sideload_image_if_url($url) {

    if (
        !$url ||
        !filter_var(
            $url,
            FILTER_VALIDATE_URL
        )
    ) {

        return null;
    }


    require_once ABSPATH .
        'wp-admin/includes/media.php';

    require_once ABSPATH .
        'wp-admin/includes/file.php';

    require_once ABSPATH .
        'wp-admin/includes/image.php';


    $id = media_sideload_image(
        $url,
        0,
        null,
        'id'
    );


    return is_wp_error($id)
        ? null
        : $id;
}
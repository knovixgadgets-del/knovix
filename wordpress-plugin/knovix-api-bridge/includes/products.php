<?php
if (!defined('ABSPATH')) exit;

function knovix_register_product_routes() {

    register_rest_route(KNOVIX_API_NS, '/categories', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function () {
            $terms = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
            if (is_wp_error($terms)) return [];
            return array_values(array_filter(array_map(function ($t) {
                if ($t->slug === 'uncategorized') return null;
                $thumb_id = get_term_meta($t->term_id, 'thumbnail_id', true);
                return [
                    'id'    => $t->slug,
                    'name'  => $t->name,
                    'image' => $thumb_id ? wp_get_attachment_image_url($thumb_id, 'medium') : ''
                ];
            }, $terms)));
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/products', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $args = ['status' => 'publish', 'limit' => 100];

            if ($category = $req->get_param('category')) {
                $args['category'] = [$category];
            }
            if ($search = $req->get_param('search')) {
                $args['s'] = sanitize_text_field($search);
            }
            switch ($req->get_param('sort')) {
                case 'price_asc':  $args['orderby'] = 'price'; $args['order'] = 'ASC'; break;
                case 'price_desc': $args['orderby'] = 'price'; $args['order'] = 'DESC'; break;
                case 'rating':     $args['orderby'] = 'rating'; $args['order'] = 'DESC'; break;
            }

            $products = wc_get_products($args);
            return array_map('knovix_format_product', $products);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/products/(?P<id>\d+)', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $product = wc_get_product((int) $req['id']);
            if (!$product) return knovix_error('Product not found', 404);
            return knovix_format_product($product);
        }
    ]);

    // ---- admin-only writes ----

    register_rest_route(KNOVIX_API_NS, '/products', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_require_admin',
        'callback' => function (WP_REST_Request $req) {
            $product = new WC_Product_Simple();
            knovix_apply_product_fields($product, $req);
            $product->save();
            return knovix_format_product($product);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/products/(?P<id>\d+)', [
        'methods'  => ['PATCH', 'PUT'],
        'permission_callback' => 'knovix_require_admin',
        'callback' => function (WP_REST_Request $req) {
            $product = wc_get_product((int) $req['id']);
            if (!$product) return knovix_error('Product not found', 404);
            knovix_apply_product_fields($product, $req);
            $product->save();
            return knovix_format_product($product);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/products/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'permission_callback' => 'knovix_require_admin',
        'callback' => function (WP_REST_Request $req) {
            $product = wc_get_product((int) $req['id']);
            if (!$product) return knovix_error('Product not found', 404);
            $product->delete(true);
            return ['success' => true];
        }
    ]);
}

/** Map the frontend's ProductForm payload onto a WC_Product. */
function knovix_apply_product_fields($product, WP_REST_Request $req) {
    if ($req->get_param('name') !== null) $product->set_name(sanitize_text_field($req->get_param('name')));
    if ($req->get_param('description') !== null) $product->set_description(wp_kses_post($req->get_param('description')));
    if ($req->get_param('price') !== null) $product->set_regular_price((string) $req->get_param('price'));
    if ($req->get_param('mrp') !== null) $product->set_regular_price((string) $req->get_param('mrp'));
    if ($req->get_param('price') !== null && $req->get_param('mrp') !== null
        && (float) $req->get_param('price') < (float) $req->get_param('mrp')) {
        $product->set_sale_price((string) $req->get_param('price'));
    }
    if ($req->get_param('stock') !== null) {
        $product->set_manage_stock(true);
        $product->set_stock_quantity((int) $req->get_param('stock'));
        $product->set_stock_status($req->get_param('stock') > 0 ? 'instock' : 'outofstock');
    }
    if ($req->get_param('featured') !== null) $product->set_featured((bool) $req->get_param('featured'));

    if ($req->get_param('category') !== null) {
        $term = get_term_by('slug', sanitize_title($req->get_param('category')), 'product_cat');
        if ($term) $product->set_category_ids([$term->term_id]);
    }
    if ($req->get_param('image') !== null) {
        $attach_id = knovix_sideload_image_if_url($req->get_param('image'));
        if ($attach_id) $product->set_image_id($attach_id);
    }
    if ($req->get_param('bestSeller') !== null) {
        // saved after $product->save() by the caller normally, but WC has no
        // native setter for custom meta pre-save on all versions — set directly:
        add_action('woocommerce_after_product_object_save', function ($p) use ($req) {
            update_post_meta($p->get_id(), '_knovix_bestseller', $req->get_param('bestSeller') ? 'yes' : 'no');
        }, 10, 1);
    }
    $product->set_status('publish');
}

/** Accepts an external image URL from the admin form and imports it into the media library. */
function knovix_sideload_image_if_url($url) {
    if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) return null;
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $id = media_sideload_image($url, 0, null, 'id');
    return is_wp_error($id) ? null : $id;
}

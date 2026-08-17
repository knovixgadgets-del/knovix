<?php
if (!defined('ABSPATH')) exit;

/**
 * Standard error response helper — every handler returns errors in the same
 * { message } shape the frontend's apiFetch() already expects.
 */
function knovix_error($message, $status = 400) {
    return new WP_Error('knovix_error', $message, ['status' => $status]);
}

/**
 * Require the current request to be an admin (WooCommerce manager).
 * Used as a permission_callback on write endpoints.
 */
function knovix_require_admin() {
    return current_user_can('manage_woocommerce');
}

/** Anyone may call — permission is decided inside the handler if needed. */
function knovix_public_permission() {
    return true;
}

/**
 * Shape a WC_Product into exactly the Product object the React app expects
 * (see src/data/mockData.js in the frontend project for the reference shape).
 */
function knovix_format_product($product) {
    if (!$product) return null;
    $image_id = $product->get_image_id();
    $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'large') : wc_placeholder_img_src('large');
    $categories = wc_get_product_category_list($product->get_id(), ', ', '', '');
    $terms = get_the_terms($product->get_id(), 'product_cat');
    $category_slug = $terms && !is_wp_error($terms) ? $terms[0]->slug : '';

    return [
        'id'          => (string) $product->get_id(),
        'name'        => $product->get_name(),
        'category'    => $category_slug,
        'price'       => (float) ($product->get_sale_price() ?: $product->get_regular_price()),
        'mrp'         => (float) $product->get_regular_price(),
        'rating'      => (float) $product->get_average_rating(),
        'reviews'     => (int) $product->get_review_count(),
        'stock'       => $product->managing_stock() ? (int) $product->get_stock_quantity() : ($product->is_in_stock() ? 999 : 0),
        'image'       => $image_url,
        'description' => wp_strip_all_tags($product->get_short_description() ?: $product->get_description()),
        'featured'    => (bool) $product->is_featured(),
        'bestSeller'  => get_post_meta($product->get_id(), '_knovix_bestseller', true) === 'yes'
    ];
}

/** Shape a WC_Order into the Order object the frontend expects. */
function knovix_format_order($order) {
    if (!$order) return null;
    $items = [];
    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $items[] = [
            'id'    => (string) $item->get_product_id(),
            'name'  => $item->get_name(),
            'price' => (float) $order->get_item_total($item, false, false),
            'qty'   => (int) $item->get_quantity(),
            'image' => $product ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : ''
        ];
    }
    return [
        'id'        => (string) $order->get_id(),
        'userId'    => $order->get_customer_id() ? (string) $order->get_customer_id() : null,
        'customer'  => [
            'name'    => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
            'phone'   => $order->get_billing_phone(),
            'address' => $order->get_billing_address_1(),
            'city'    => $order->get_billing_city(),
            'state'   => $order->get_billing_state(),
            'pincode' => $order->get_billing_postcode()
        ],
        'items'     => $items,
        'subtotal'  => (float) $order->get_subtotal(),
        'shipping'  => (float) $order->get_shipping_total(),
        'total'     => (float) $order->get_total(),
        'payment'   => $order->get_payment_method(),
        'status'    => knovix_map_order_status($order->get_status()),
        'createdAt' => $order->get_date_created() ? $order->get_date_created()->date('c') : null
    ];
}

/** WooCommerce statuses -> the 4 statuses the frontend's admin UI knows about. */
function knovix_map_order_status($wc_status) {
    $map = [
        'pending'    => 'placed',
        'processing' => 'placed',
        'on-hold'    => 'placed',
        'shipped'    => 'shipped',
        'completed'  => 'delivered',
        'cancelled'  => 'cancelled',
        'refunded'   => 'cancelled',
        'failed'     => 'cancelled'
    ];
    return $map[$wc_status] ?? $wc_status;
}
function knovix_unmap_order_status($frontend_status) {
    $map = [
        'placed'    => 'processing',
        'shipped'   => 'shipped', // requires a custom WC order status registered, see README
        'delivered' => 'completed',
        'cancelled' => 'cancelled'
    ];
    return $map[$frontend_status] ?? 'processing';
}

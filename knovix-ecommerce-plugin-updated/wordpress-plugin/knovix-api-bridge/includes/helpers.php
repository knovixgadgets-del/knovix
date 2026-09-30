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

    // Gallery: featured image first, then any WooCommerce product gallery
    // images. Powers the multi-image gallery on the product detail page —
    // 'image' (singular) is kept as-is for existing callers/backwards
    // compatibility and is always images[0].
    $gallery_ids = array_filter(array_unique(array_merge(
        [$image_id],
        $product->get_gallery_image_ids()
    )));
    $images = array_values(array_filter(array_map(
        fn($id) => wp_get_attachment_image_url($id, 'large'),
        $gallery_ids
    )));
    if (empty($images)) {
        $images = [$image_url];
    }

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
        'images'      => $images,
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


/**
 * Shipping rules, read live from WooCommerce > Settings > Shipping so the
 * store owner controls them there (Free shipping "minimum order amount" and
 * the Flat rate cost). Falls back to the constants in knovix-api-bridge.php
 * only if no matching method is configured.
 *
 * Returns [ 'freeMin' => float|null, 'fee' => float ]
 */
function knovix_get_shipping_rules() {
    $free_min = null;
    $fee      = null;

    if (class_exists('WC_Shipping_Zones')) {
        $zone_ids = [];
        foreach (WC_Shipping_Zones::get_zones() as $z) {
            $zone_ids[] = (int) $z['zone_id'];
        }
        $zone_ids[] = 0; // "Locations not covered by your other zones"

        foreach ($zone_ids as $zone_id) {
            $zone = new WC_Shipping_Zone($zone_id);
            foreach ($zone->get_shipping_methods(true) as $method) { // enabled only
                if ($method->id === 'free_shipping' && $free_min === null) {
                    $requires = $method->get_option('requires');
                    if (in_array($requires, ['min_amount', 'either', 'both'], true)) {
                        $free_min = (float) $method->get_option('min_amount');
                    } elseif ($requires === '' || $requires === false) {
                        $free_min = 0.0; // free for every order
                    }
                }
                if ($method->id === 'flat_rate' && $fee === null) {
                    $cost = $method->get_option('cost');
                    if (is_numeric($cost)) $fee = (float) $cost;
                }
            }
        }
    }

    if ($free_min === null && defined('KNOVIX_FREE_SHIPPING_MIN')) $free_min = (float) KNOVIX_FREE_SHIPPING_MIN;
    if ($fee === null) $fee = defined('KNOVIX_SHIPPING_FEE') ? (float) KNOVIX_SHIPPING_FEE : 49.0;

    return ['freeMin' => $free_min, 'fee' => $fee];
}

/** Accepts a WooCommerce state code ("TN") or name ("Tamil Nadu"); returns the code or ''. */
function knovix_state_code($input) {
    $input = trim((string) $input);
    if ($input === '' || !function_exists('WC')) return '';
    $states = WC()->countries->get_states('IN');
    if (!is_array($states)) return '';
    if (isset($states[strtoupper($input)])) return strtoupper($input);
    foreach ($states as $code => $name) {
        if (strcasecmp($name, $input) === 0) return $code;
    }
    return '';
}

/**
 * Real, destination-aware shipping quote that works with whatever is already
 * set up under WooCommerce > Settings > Shipping — no extra configuration.
 *
 *  - The zone is matched from the customer's state + pincode exactly like
 *    WooCommerce does (first matching zone wins, else "Everywhere").
 *  - Free shipping: honours "no requirement" and "minimum order amount".
 *  - Flat rate (and any other rate-based method): WooCommerce's own
 *    calculate_shipping() is used, so plain costs, formulas like
 *    10 * [qty] and shipping-class costs all work.
 *  - The cheapest available rate is charged.
 *
 * $lines: [ ['product' => WC_Product, 'qty' => int, 'total' => float], ... ]
 *
 * Returns:
 *   [ 'available' => true,  'shipping' => 0|49|..., 'zone' => 'South Region' ]
 *   [ 'available' => false, 'reason'   => 'incomplete'|'unavailable' ]
 */
function knovix_quote_shipping($subtotal, $state, $pincode, $lines = []) {
    $state_code = knovix_state_code($state);
    $pincode    = preg_replace('/\D/', '', (string) $pincode);
    if ($state_code === '' || strlen($pincode) !== 6) {
        return ['available' => false, 'reason' => 'incomplete'];
    }

    $contents = [];
    foreach ($lines as $i => $l) {
        $contents['knovix_' . $i] = [
            'key'               => 'knovix_' . $i,
            'product_id'        => $l['product']->get_id(),
            'variation_id'      => 0,
            'variation'         => [],
            'quantity'          => (int) $l['qty'],
            'data'              => $l['product'],
            'data_hash'         => '',
            'line_tax_data'     => ['subtotal' => [], 'total' => []],
            'line_subtotal'     => (float) $l['total'],
            'line_subtotal_tax' => 0,
            'line_total'        => (float) $l['total'],
            'line_tax'          => 0,
        ];
    }

    $package = [
        'contents'        => $contents,
        'contents_cost'   => $subtotal,
        'applied_coupons' => [],
        'user'            => ['ID' => 0],
        'destination'     => [
            'country' => 'IN', 'state' => $state_code, 'postcode' => $pincode,
            'city' => '', 'address' => '', 'address_1' => '', 'address_2' => ''
        ],
    ];
    $zone = WC_Shipping_Zones::get_zone_matching_package($package);

    $best = null;
    foreach ($zone->get_shipping_methods(true) as $method) { // enabled methods only
        $cost = null;

        if ($method->id === 'free_shipping') {
            $requires = $method->get_option('requires');
            if ($requires === '' || $requires === false) {
                $cost = 0.0;
            } elseif (in_array($requires, ['min_amount', 'either'], true)
                      && $subtotal >= (float) $method->get_option('min_amount')) {
                $cost = 0.0;
            } // 'coupon' / 'both' need a coupon, which this storefront doesn't support

        } elseif ($method->id !== 'local_pickup') {
            try {
                $method->calculate_shipping($package);
                foreach ((array) $method->rates as $rate) {
                    $c = (float) $rate->get_cost();
                    if ($cost === null || $c < $cost) $cost = $c;
                }
            } catch (\Throwable $e) {
                $c = $method->get_option('cost');
                if (is_numeric($c)) $cost = (float) $c;
            }
        }

        if ($cost !== null && ($best === null || $cost < $best)) $best = $cost;
    }

    if ($best === null) return ['available' => false, 'reason' => 'unavailable'];
    return ['available' => true, 'shipping' => $best, 'zone' => $zone->get_zone_name()];
}

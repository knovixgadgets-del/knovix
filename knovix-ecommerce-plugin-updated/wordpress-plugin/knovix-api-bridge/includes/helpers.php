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
            'state'   => knovix_state_name($order->get_billing_state()),
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
/** "1,000.50" / "250" / "" -> float, honouring the store's decimal/thousand separators. */
function knovix_parse_amount($v) {
    if ($v === null || $v === false || $v === '') return 0.0;
    return (float) (function_exists('wc_format_decimal') ? wc_format_decimal($v) : $v);
}

/**
 * The ONE place that decides how a WooCommerce "Free shipping" method qualifies,
 * shared by the storefront banner (/shipping) and the real quote/order price.
 * (They used to disagree: the banner counted the "coupon AND amount" mode as
 * free while the quote never did.)
 *
 * Returns: 0.0   -> free for every order
 *          float -> free when the order subtotal is >= that amount
 *          null  -> cannot be met by this storefront (needs a coupon)
 */
function knovix_free_shipping_threshold($method) {
    $requires = $method->get_option('requires');
    if ($requires === '' || $requires === false || $requires === null) return 0.0;
    if ($requires === 'min_amount' || $requires === 'either') {
        return knovix_parse_amount($method->get_option('min_amount'));
    }
    return null; // 'coupon' / 'both'
}

function knovix_get_shipping_rules() {
    $free_mins = []; // lowest qualifying threshold of each zone that has an enabled Free Shipping method
    $fee       = null;

    if (class_exists('WC_Shipping_Zones')) {
        $zone_ids = [];
        foreach (WC_Shipping_Zones::get_zones() as $z) {
            $zone_ids[] = (int) $z['zone_id'];
        }
        $zone_ids[] = 0; // "Locations not covered by your other zones"

        foreach ($zone_ids as $zone_id) {
            $zone = new WC_Shipping_Zone($zone_id);
            $zone_free = null;
            foreach ($zone->get_shipping_methods(true) as $method) { // enabled only
                if ($method->id === 'free_shipping') {
                    $t = knovix_free_shipping_threshold($method);
                    if ($t !== null && ($zone_free === null || $t < $zone_free)) $zone_free = $t;
                }
                if ($method->id === 'flat_rate' && $fee === null) {
                    $cost = $method->get_option('cost');
                    if (is_numeric($cost)) $fee = (float) $cost;
                }
            }
            if ($zone_free !== null) $free_mins[] = $zone_free;
        }
    }

    // Highest per-zone threshold = the amount that is free EVERYWHERE, so the banner
    // never promises more than a zone gives. null = WooCommerce has no free-shipping
    // rule, so the storefront must not advertise one (no invented default).
    $free_min = $free_mins ? max($free_mins) : null;

    if ($fee === null) $fee = defined('KNOVIX_SHIPPING_FEE') ? (float) KNOVIX_SHIPPING_FEE : 49.0;

    return ['freeMin' => $free_min, 'fee' => $fee];
}

/** Accepts a WooCommerce state code ("TN") or name ("Tamil Nadu"); returns the code or ''. */
/** WooCommerce state code -> readable name (e.g. TN -> Tamil Nadu) for display. */
function knovix_state_name($code) {
    if ($code === '' || !function_exists('WC')) return (string) $code;
    $states = WC()->countries->get_states('IN');
    return (is_array($states) && isset($states[$code])) ? $states[$code] : (string) $code;
}

function knovix_state_code($input) {
    $input = trim((string) $input);
    if ($input === '' || !function_exists('WC')) return '';
    $states = WC()->countries->get_states('IN');
    if (!is_array($states)) return '';
    if (isset($states[strtoupper($input)])) return strtoupper($input);
    // Compare names ignoring case, spaces and punctuation ("tamilnadu" == "Tamil Nadu"),
    // plus the two states WooCommerce/PIN databases still list under old names.
    $norm = function ($v) {
        $v = strtolower(preg_replace('/[^a-z]/i', '', (string) $v));
        $alias = ['orissa' => 'odisha', 'uttaranchal' => 'uttarakhand'];
        return $alias[$v] ?? $v;
    };
    $want = $norm($input);
    foreach ($states as $code => $name) {
        if ($norm($name) === $want) return $code;
    }
    return '';
}

/**
 * Optional sanity check that a pincode belongs to the chosen state, using the
 * first two digits of the Indian PIN. Prefixes we don't know are allowed.
 * OFF by default (a wrong rejection would block a real sale). Enable by adding
 *   define('KNOVIX_VALIDATE_PINCODE_STATE', true);
 * to wp-config.php.
 */
function knovix_pincode_matches_state($pincode, $state_code) {
    if (!defined('KNOVIX_VALIDATE_PINCODE_STATE') || !KNOVIX_VALIDATE_PINCODE_STATE) return true;
    $map = [
        '11' => ['DL'], '12' => ['HR'], '13' => ['HR'], '14' => ['PB'], '15' => ['PB'],
        '16' => ['PB', 'CH', 'HR'], '17' => ['HP'], '18' => ['JK', 'LA'], '19' => ['JK', 'LA'],
        '20' => ['UP', 'UK'], '21' => ['UP', 'UK'], '22' => ['UP', 'UK'], '23' => ['UP', 'UK'],
        '24' => ['UP', 'UK'], '25' => ['UP', 'UK'], '26' => ['UP', 'UK'], '27' => ['UP', 'UK'], '28' => ['UP', 'UK'],
        '30' => ['RJ'], '31' => ['RJ'], '32' => ['RJ'], '33' => ['RJ'], '34' => ['RJ'],
        '36' => ['GJ', 'DD', 'DN'], '37' => ['GJ', 'DD', 'DN'], '38' => ['GJ', 'DD', 'DN'], '39' => ['GJ', 'DD', 'DN'],
        '40' => ['MH', 'GA', 'DD', 'DN'], '41' => ['MH'], '42' => ['MH'], '43' => ['MH'], '44' => ['MH'],
        '45' => ['MP'], '46' => ['MP'], '47' => ['MP'], '48' => ['MP'], '49' => ['CT'],
        '50' => ['TS', 'TG', 'AP'], '51' => ['AP', 'TS', 'TG'], '52' => ['AP'], '53' => ['AP'],
        '56' => ['KA'], '57' => ['KA'], '58' => ['KA'], '59' => ['KA'],
        '60' => ['TN', 'PY'], '61' => ['TN', 'PY'], '62' => ['TN', 'PY'], '63' => ['TN', 'PY'], '64' => ['TN', 'PY'],
        '67' => ['KL', 'LD', 'PY'], '68' => ['KL', 'LD'], '69' => ['KL'],
        '70' => ['WB'], '71' => ['WB'], '72' => ['WB'], '73' => ['WB', 'SK'], '74' => ['WB', 'AN'],
        '75' => ['OR', 'OD'], '76' => ['OR', 'OD'], '77' => ['OR', 'OD'], '78' => ['AS'],
        '79' => ['AR', 'ML', 'MN', 'MZ', 'NL', 'TR'],
        '80' => ['BR', 'JH'], '81' => ['BR', 'JH'], '82' => ['BR', 'JH'], '83' => ['JH', 'BR'], '84' => ['BR'], '85' => ['BR', 'JH'],
    ];
    $prefix = substr((string) $pincode, 0, 2);
    if (!isset($map[$prefix])) return true;
    return in_array($state_code, $map[$prefix], true);
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
 *   [ 'available' => false, 'reason'   => 'incomplete'|'mismatch'|'unavailable' ]
 */
function knovix_quote_shipping($subtotal, $state, $pincode, $lines = [], $debug = false) {
    $state_code = knovix_state_code($state);
    $pincode    = preg_replace('/\D/', '', (string) $pincode);
    if ($state_code === '' || strlen($pincode) !== 6) {
        return ['available' => false, 'reason' => 'incomplete'];
    }
    if (!knovix_pincode_matches_state($pincode, $state_code)) {
        return ['available' => false, 'reason' => 'mismatch'];
    }
    $subtotal = round((float) $subtotal, 2);

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
    $best_id = 'flat_rate'; $best_instance = 0; $best_title = 'Shipping';
    $explain = [];

    // Does the matched zone define a Free Shipping method at all (enabled or not)?
    // If it does, the zone's own rule is respected exactly.
    $zone_has_free = false;
    foreach ($zone->get_shipping_methods(false) as $m) {
        if ($m->id === 'free_shipping') { $zone_has_free = true; break; }
    }

    foreach ($zone->get_shipping_methods(true) as $method) { // enabled methods only
        $cost = null;
        $why  = '';

        if ($method->id === 'free_shipping') {
            $t = knovix_free_shipping_threshold($method);
            if ($t === null) {
                $why = 'needs a coupon (requires=' . $method->get_option('requires') . ') - storefront has no coupons';
            } elseif ($subtotal >= $t) {
                $cost = 0.0;
                $why  = "subtotal {$subtotal} >= minimum {$t}";
            } else {
                $why = "subtotal {$subtotal} < minimum {$t}";
            }

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
            $why = $cost === null ? 'no rate' : 'rate ' . $cost;
        }

        $explain[] = ['method' => $method->id, 'title' => $method->get_title(), 'cost' => $cost, 'note' => $why];
        if ($cost !== null && ($best === null || $cost < $best)) {
            $best = $cost; $best_id = $method->id; $best_instance = (int) $method->get_instance_id(); $best_title = $method->get_title();
        }
    }

    // The storefront advertises ONE store-wide "free shipping above Rs X" (built from
    // the WooCommerce zones, see knovix_get_shipping_rules). If the customer's zone
    // has no Free Shipping method (e.g. it was only added to another zone), that
    // promise used to be broken and the flat fee was charged anyway. Honour it here.
    // Opt out with define('KNOVIX_STRICT_ZONE_FREE_SHIPPING', true) in wp-config.php.
    if (!$zone_has_free && !(defined('KNOVIX_STRICT_ZONE_FREE_SHIPPING') && KNOVIX_STRICT_ZONE_FREE_SHIPPING)) {
        $rules = knovix_get_shipping_rules();
        if ($rules['freeMin'] !== null && $subtotal >= $rules['freeMin'] && ($best === null || $best > 0)) {
            $best = 0.0; $best_id = 'free_shipping'; $best_instance = 0; $best_title = 'Free shipping';
            $explain[] = ['method' => 'free_shipping', 'title' => 'Free shipping (store-wide)', 'cost' => 0.0,
                          'note' => "zone '" . $zone->get_zone_name() . "' has no Free Shipping method; applied store-wide minimum {$rules['freeMin']}"];
        }
    }

    if ($best === null) {
        $out = ['available' => false, 'reason' => 'unavailable'];
        if ($debug) $out['debug'] = ['zone' => $zone->get_zone_name(), 'subtotal' => $subtotal, 'methods' => $explain];
        return $out;
    }
    $out = [
        'available'    => true,
        'shipping'     => $best,
        'zone'         => $zone->get_zone_name(),
        'method_id'    => $best_id,
        'instance_id'  => $best_instance,
        'method_title' => $best_title,
    ];
    if ($debug) $out['debug'] = ['zone' => $zone->get_zone_name(), 'subtotal' => $subtotal, 'methods' => $explain];
    return $out;
}

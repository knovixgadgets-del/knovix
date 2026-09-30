<?php
if (!defined('ABSPATH')) exit;

function knovix_register_order_routes() {

    // Public: the storefront reads the shipping rules configured in
    // WooCommerce so cart/checkout always match the backend.
    register_rest_route(KNOVIX_API_NS, '/shipping', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function () {
            // Never cache: the merchant edits these in WooCommerce and expects them live.
            $res = rest_ensure_response(knovix_get_shipping_rules());
            $res->header('Cache-Control', 'no-store, max-age=0');
            return $res;
        }
    ]);

    // Indian states exactly as WooCommerce names/codes them (for the checkout dropdown).
    register_rest_route(KNOVIX_API_NS, '/shipping/states', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function () {
            $out = [];
            foreach ((array) WC()->countries->get_states('IN') as $code => $name) {
                $out[] = ['code' => $code, 'name' => $name];
            }
            return $out;
        }
    ]);

    // Shipping quote for a destination, using WooCommerce shipping zones.
    register_rest_route(KNOVIX_API_NS, '/shipping/quote', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $subtotal = 0.0;
            $lines = [];
            foreach ((array) ($req->get_param('items') ?: []) as $line) {
                $product = wc_get_product((int) ($line['id'] ?? 0));
                if (!$product) continue;
                $qty   = max(1, (int) ($line['qty'] ?? 1));
                $total = (float) $product->get_price() * $qty;
                $subtotal += $total;
                $lines[] = ['product' => $product, 'qty' => $qty, 'total' => $total];
            }
            // ?debug=1 adds a per-method explanation of the decision (handy to see why a
            // given subtotal was/wasn't free: open the Network tab, or POST to /shipping/quote).
            $res = rest_ensure_response(knovix_quote_shipping($subtotal, $req->get_param('state'), $req->get_param('pincode'), $lines, (bool) $req->get_param('debug')));
            $res->header('Cache-Control', 'no-store, max-age=0');
            return $res;
        }
    ]);

    // Guest checkout is allowed, same as the mock backend — pass a Bearer
    // token if logged in and the order is attached to that account.
    register_rest_route(KNOVIX_API_NS, '/orders', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $customer = $req->get_param('customer') ?: [];
            $items = $req->get_param('items') ?: [];
            $payment = $req->get_param('payment') ?: 'cod';

            if (empty($items)) return knovix_error('Order must contain at least one item', 400);

            $phone = preg_replace('/\D/', '', (string) ($customer['phone'] ?? ''));
            if (strlen($phone) === 12 && strpos($phone, '91') === 0) $phone = substr($phone, 2);
            if (strlen($phone) !== 10) return knovix_error('Please enter a valid 10-digit mobile number.', 400);

            // 1) Validate every line and price it server-side BEFORE touching the DB.
            $lines = [];
            $subtotal = 0.0;
            foreach ($items as $line) {
                $product = wc_get_product((int) ($line['id'] ?? 0));
                if (!$product || !$product->is_purchasable()) {
                    return knovix_error('An item in your cart is no longer available. Please review your cart.', 400);
                }
                $qty   = max(1, (int) ($line['qty'] ?? 1));
                $total = (float) $product->get_price() * $qty;
                $subtotal += $total;
                $lines[] = ['product' => $product, 'qty' => $qty, 'total' => $total];
            }

            // 2) Shipping is decided here from the WooCommerce shipping zones for the
            //    customer's state + pincode, using the real line-item subtotal —
            //    never trusted from the browser.
            $quote = knovix_quote_shipping($subtotal, $customer['state'] ?? '', $customer['pincode'] ?? '', $lines);
            if (empty($quote['available'])) {
                $reason = $quote['reason'] ?? '';
                $msg = 'Sorry, we do not deliver to this location.';
                if ($reason === 'incomplete') $msg = 'Please select your state and enter a valid 6-digit pincode.';
                if ($reason === 'mismatch')   $msg = 'This pincode does not match the selected state. Please check and try again.';
                return knovix_error($msg, 422);
            }

            // 3) Only now create the order.
            $order = wc_create_order();
            if (is_wp_error($order)) return knovix_error($order->get_error_message(), 400);

            foreach ($lines as $l) {
                $order->add_product($l['product'], $l['qty']);
            }

            $state_code = knovix_state_code($customer['state'] ?? '');
            $name_parts = explode(' ', trim($customer['name'] ?? ''), 2);
            $addr = [
                'first_name' => $name_parts[0] ?? '',
                'last_name'  => $name_parts[1] ?? '',
                'address_1'  => sanitize_text_field($customer['address'] ?? ''),
                'city'       => sanitize_text_field($customer['city'] ?? ''),
                'state'      => $state_code,
                'postcode'   => preg_replace('/\D/', '', (string) ($customer['pincode'] ?? '')),
                'country'    => 'IN',
            ];
            $order->set_address($addr, 'billing');
            $order->set_address($addr, 'shipping');
            $order->set_billing_phone($phone);

            if (is_user_logged_in()) $order->set_customer_id(get_current_user_id());

            $order->set_payment_method($payment);
            $order->set_payment_method_title(strtoupper($payment));

            // Record the shipping line (even when free) with the real method + zone.
            $ship_item = new WC_Order_Item_Shipping();
            $ship_item->set_method_id($quote['method_id'] ?? 'flat_rate');
            if (!empty($quote['instance_id'])) $ship_item->set_instance_id((int) $quote['instance_id']);
            $ship_item->set_method_title($quote['method_title'] ?? 'Shipping');
            $ship_item->set_total((float) $quote['shipping']);
            if (!empty($quote['zone'])) $ship_item->add_meta_data('Shipping zone', $quote['zone'], true);
            $order->add_item($ship_item);

            $order->calculate_totals();
            $order->set_status('processing'); // COD/UPI/Card all recorded as processing until fulfilled
            $order->save();

            // orderKey lets a guest re-open this confirmation later (see GET /orders/:id).
            return array_merge(knovix_format_order($order), ['orderKey' => $order->get_order_key()]);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/orders', [
        'methods'  => 'GET',
        'permission_callback' => 'is_user_logged_in',
        'callback' => function (WP_REST_Request $req) {
            $is_admin = current_user_can('manage_woocommerce');
            $args = ['limit' => -1, 'orderby' => 'date', 'order' => 'DESC'];

            if (!$is_admin) {
                // customers may only ever see their own orders, regardless
                // of what userId query param is passed
                $args['customer_id'] = get_current_user_id();
            } elseif ($user_id = $req->get_param('userId')) {
                $args['customer_id'] = (int) $user_id;
            }

            $orders = wc_get_orders($args);
            return array_map('knovix_format_order', $orders);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/orders/(?P<id>\d+)', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission', // order-success page is reachable right after guest checkout
        'callback' => function (WP_REST_Request $req) {
            $order = wc_get_order((int) $req['id']);
            if (!$order) return knovix_error('Order not found', 404);

            $is_owner = is_user_logged_in() && $order->get_customer_id() === get_current_user_id();
            $is_admin = current_user_can('manage_woocommerce');
            // Order IDs are sequential, so without this check anyone could read every
            // guest customer's name/phone/address by counting up IDs. A guest must
            // present the order key that was handed out when the order was placed.
            $key    = (string) $req->get_param('key');
            $key_ok = $key !== '' && hash_equals((string) $order->get_order_key(), $key);
            if (!$is_owner && !$is_admin && !$key_ok) {
                return knovix_error('Not authorized to view this order', 403);
            }
            return knovix_format_order($order);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/orders/(?P<id>\d+)/status', [
        'methods'  => 'PATCH',
        'permission_callback' => 'knovix_require_admin',
        'callback' => function (WP_REST_Request $req) {
            $order = wc_get_order((int) $req['id']);
            if (!$order) return knovix_error('Order not found', 404);

            $status = $req->get_param('status');
            $order->set_status(knovix_unmap_order_status($status));
            $order->save();
            return knovix_format_order($order);
        }
    ]);
}

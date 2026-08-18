<?php
if (!defined('ABSPATH')) exit;

function knovix_register_order_routes() {

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

            $order = wc_create_order();
            if (is_wp_error($order)) return knovix_error($order->get_error_message(), 400);

            foreach ($items as $line) {
                $product = wc_get_product((int) $line['id']);
                if (!$product) continue;
                $order->add_product($product, (int) $line['qty']);
            }

            $name_parts = explode(' ', trim($customer['name'] ?? ''), 2);
            $order->set_billing_first_name($name_parts[0] ?? '');
            $order->set_billing_last_name($name_parts[1] ?? '');
            $order->set_billing_phone(sanitize_text_field($customer['phone'] ?? ''));
            $order->set_billing_address_1(sanitize_text_field($customer['address'] ?? ''));
            $order->set_billing_city(sanitize_text_field($customer['city'] ?? ''));
            $order->set_billing_state(sanitize_text_field($customer['state'] ?? ''));
            $order->set_billing_postcode(sanitize_text_field($customer['pincode'] ?? ''));

            if (is_user_logged_in()) $order->set_customer_id(get_current_user_id());

            $order->set_payment_method($payment);
            $order->set_payment_method_title(strtoupper($payment));

            $shipping = (float) ($req->get_param('shipping') ?: 0);
            if ($shipping > 0) {
                $item = new WC_Order_Item_Shipping();
                $item->set_method_title('Standard Shipping');
                $item->set_total($shipping);
                $order->add_item($item);
            }

            $order->calculate_totals();
            $order->set_status('processing'); // COD/UPI/Card all recorded as processing until fulfilled
            $order->save();

            return knovix_format_order($order);
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
            if ($order->get_customer_id() && !$is_owner && !$is_admin) {
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

<?php
if (!defined('ABSPATH')) exit;

/**
 * Lightweight bearer-token auth, self-contained (no separate JWT plugin
 * needed). A token is a random string stored in user meta with an expiry;
 * the frontend sends it back as `Authorization: Bearer <token>`.
 */

const KNOVIX_TOKEN_TTL = 30 * DAY_IN_SECONDS;

function knovix_issue_token($user_id) {
    $token = wp_generate_password(48, false);
    update_user_meta($user_id, '_knovix_api_token', wp_hash_password($token));
    update_user_meta($user_id, '_knovix_api_token_expires', time() + KNOVIX_TOKEN_TTL);
    return $token;
}

function knovix_authenticate_bearer_token($user_id) {
    if (!empty($user_id)) return $user_id; // already resolved by something else

    $auth_header = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!$auth_header || stripos($auth_header, 'Bearer ') !== 0) return $user_id;

    $token = trim(substr($auth_header, 7));
    if (!$token) return $user_id;

    // Tokens are stored hashed, so we must check them against every user's
    // hash. Fine for small/medium stores; for very large ones, store a
    // lookup index (token prefix -> user id) instead.
    global $wpdb;
    $rows = $wpdb->get_results(
        "SELECT user_id, meta_value FROM {$wpdb->usermeta} WHERE meta_key = '_knovix_api_token'"
    );
    foreach ($rows as $row) {
        if (wp_check_password($token, $row->meta_value)) {
            $expires = (int) get_user_meta($row->user_id, '_knovix_api_token_expires', true);
            if ($expires < time()) return $user_id; // expired
            return (int) $row->user_id;
        }
    }
    return $user_id;
}

function knovix_current_user_response($user) {
    return [
        'id'    => (string) $user->ID,
        'name'  => $user->display_name,
        'email' => $user->user_email,
        'role'  => in_array('administrator', $user->roles) || in_array('shop_manager', $user->roles) ? 'admin' : 'customer'
    ];
}

function knovix_register_auth_routes() {
    register_rest_route(KNOVIX_API_NS, '/auth/login', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $email = sanitize_email($req->get_param('email'));
            $password = (string) $req->get_param('password');
            $user = get_user_by('email', $email);
            if (!$user || !wp_check_password($password, $user->user_pass, $user->ID)) {
                return knovix_error('Invalid email or password', 401);
            }
            $token = knovix_issue_token($user->ID);
            return array_merge(knovix_current_user_response($user), ['token' => $token]);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/auth/signup', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $name = sanitize_text_field($req->get_param('name'));
            $email = sanitize_email($req->get_param('email'));
            $password = (string) $req->get_param('password');

            if (email_exists($email)) return knovix_error('An account with this email already exists', 409);

            $user_id = wp_create_user($email, $password, $email);
            if (is_wp_error($user_id)) return knovix_error($user_id->get_error_message(), 400);

            wp_update_user(['ID' => $user_id, 'display_name' => $name, 'first_name' => $name]);
            $user = get_user_by('id', $user_id);
            $token = knovix_issue_token($user_id);
            return array_merge(knovix_current_user_response($user), ['token' => $token]);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/auth/logout', [
        'methods'  => 'POST',
        'permission_callback' => 'is_user_logged_in',
        'callback' => function () {
            delete_user_meta(get_current_user_id(), '_knovix_api_token');
            delete_user_meta(get_current_user_id(), '_knovix_api_token_expires');
            return ['success' => true];
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/auth/session', [
        'methods'  => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function () {
            if (!is_user_logged_in()) return null;
            return knovix_current_user_response(wp_get_current_user());
        }
    ]);
}

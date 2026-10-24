<?php
if (!defined('ABSPATH')) exit;

/**
 * Lightweight bearer-token auth, self-contained (no separate JWT plugin
 * needed). A token is a random string stored in user meta with an expiry;
 * the frontend sends it back as `Authorization: Bearer <token>`.
 */

const KNOVIX_TOKEN_TTL = 30 * DAY_IN_SECONDS;

/**
 * Tokens are random 48-char strings, so a plain SHA-256 is enough to store them
 * safely AND lets us find the owner with one indexed lookup. (The old code stored
 * a slow bcrypt/phpass hash and then looped over EVERY user with a token, running
 * a password check for each one on every single API request - which gets slower
 * with each customer and eventually times out the whole storefront.)
 */
function knovix_hash_token($token) {
    return hash('sha256', (string) $token);
}

/**
 * Each login gets its OWN token row, so a customer logged in on their phone is not
 * logged out when they sign in on a laptop (the old code kept a single token per
 * user and overwrote it on every login). The 5 newest tokens per user are kept.
 */
const KNOVIX_MAX_TOKENS_PER_USER = 5;

function knovix_token_expiry_key($hash) {
    return '_knovix_api_token_exp_' . substr($hash, 0, 16);
}

function knovix_issue_token($user_id) {
    $token = wp_generate_password(48, false);
    $hash  = knovix_hash_token($token);

    add_user_meta($user_id, '_knovix_api_token', $hash, false);
    update_user_meta($user_id, knovix_token_expiry_key($hash), time() + KNOVIX_TOKEN_TTL);
    // legacy single-token expiry, kept so tokens issued by older versions keep working
    update_user_meta($user_id, '_knovix_api_token_expires', time() + KNOVIX_TOKEN_TTL);

    // Prune expired tokens and anything beyond the newest N.
    $hashes = (array) get_user_meta($user_id, '_knovix_api_token', false);
    $keep   = [];
    foreach ($hashes as $h) {
        $exp = (int) get_user_meta($user_id, knovix_token_expiry_key($h), true);
        if ($exp && $exp < time()) {
            delete_user_meta($user_id, '_knovix_api_token', $h);
            delete_user_meta($user_id, knovix_token_expiry_key($h));
        } else {
            $keep[] = $h;
        }
    }
    while (count($keep) > KNOVIX_MAX_TOKENS_PER_USER) {
        $old = array_shift($keep);
        delete_user_meta($user_id, '_knovix_api_token', $old);
        delete_user_meta($user_id, knovix_token_expiry_key($old));
    }

    return $token;
}

/**
 * Read the bearer token from the request. Shared hosts running LiteSpeed or
 * Apache-FastCGI (Hostinger, etc.) frequently strip the standard Authorization
 * header before PHP sees it - every logged-in request then looks anonymous, so
 * the session never restores, orders 401 and wp-admin style actions fail.
 * We therefore also accept X-Knovix-Token (never stripped) and the common
 * server-variable fallbacks.
 */
function knovix_get_bearer_token() {
    $candidates = [];

    foreach (['HTTP_X_KNOVIX_TOKEN'] as $key) {
        if (!empty($_SERVER[$key])) return trim((string) $_SERVER[$key]);
    }

    foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $key) {
        if (!empty($_SERVER[$key])) $candidates[] = (string) $_SERVER[$key];
    }

    if (empty($candidates) && function_exists('getallheaders')) {
        foreach ((array) getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') { $candidates[] = (string) $value; break; }
            if (strtolower($name) === 'x-knovix-token' && $value) return trim((string) $value);
        }
    }

    foreach ($candidates as $header) {
        if (stripos($header, 'Bearer ') === 0) return trim(substr($header, 7));
    }
    return '';
}

function knovix_authenticate_bearer_token($user_id) {
    if (!empty($user_id)) return $user_id; // already resolved by something else

    $token = knovix_get_bearer_token();
    if ($token === '') return $user_id;

    global $wpdb;
    $found = $wpdb->get_var($wpdb->prepare(
        "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = '_knovix_api_token' AND meta_value = %s LIMIT 1",
        knovix_hash_token($token)
    ));
    if (!$found) return $user_id;

    $hash    = knovix_hash_token($token);
    $expires = (int) get_user_meta($found, knovix_token_expiry_key($hash), true);
    if (!$expires) $expires = (int) get_user_meta($found, '_knovix_api_token_expires', true); // token from an older version
    if ($expires < time()) return $user_id; // expired

    return (int) $found;
}

function knovix_current_user_response($user) {
    $phone = get_user_meta($user->ID, '_knovix_phone', true);
    return [
        'id'    => (string) $user->ID,
        'name'  => $user->display_name,
        'email' => $user->user_email,
        'phone' => $phone ?: null,
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
            // Basic brute-force guard: 8 wrong passwords per email+IP per 15 minutes.
            $ip       = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
            $try_key  = 'knovix_login_' . md5(strtolower($email) . '|' . $ip);
            $failures = (int) get_transient($try_key);
            if ($failures >= 8) {
                return knovix_error('Too many failed attempts. Please try again in a few minutes.', 429);
            }

            $user = get_user_by('email', $email);
            if (!$user || !wp_check_password($password, $user->user_pass, $user->ID)) {
                set_transient($try_key, $failures + 1, 15 * MINUTE_IN_SECONDS);
                return knovix_error('Invalid email or password', 401);
            }
            delete_transient($try_key);
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

            if (!is_email($email)) return knovix_error('Please enter a valid email address.', 422);
            if (strlen($password) < 6) return knovix_error('Password must be at least 6 characters.', 422);
            if (email_exists($email)) return knovix_error('An account with this email already exists', 409);

            $user_id = wp_create_user($email, $password, $email);
            if (is_wp_error($user_id)) return knovix_error($user_id->get_error_message(), 400);

            wp_update_user(['ID' => $user_id, 'display_name' => $name, 'first_name' => $name]);
            $user = get_user_by('id', $user_id);
            // wp_create_user() uses WordPress's default role (often "subscriber");
            // shoppers must be WooCommerce "customer"s.
            if ($user && get_role('customer')) $user->set_role('customer');
            $token = knovix_issue_token($user_id);
            return array_merge(knovix_current_user_response($user), ['token' => $token]);
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/auth/logout', [
        'methods'  => 'POST',
        'permission_callback' => 'is_user_logged_in',
        'callback' => function () {
            $uid   = get_current_user_id();
            $token = knovix_get_bearer_token();
            if ($token !== '') {
                $hash = knovix_hash_token($token);
                delete_user_meta($uid, '_knovix_api_token', $hash);
                delete_user_meta($uid, knovix_token_expiry_key($hash));
            }
            return ['success' => true];
        }
    ]);

    // Lets a brand-new phone/OTP customer set their name right after verifying.
    // (The OTP is single-use, so the frontend cannot re-send it just to add a name.)
    register_rest_route(KNOVIX_API_NS, '/auth/profile', [
        'methods'  => 'POST',
        'permission_callback' => 'is_user_logged_in',
        'callback' => function (WP_REST_Request $req) {
            $name = trim(sanitize_text_field((string) $req->get_param('name')));
            if ($name === '' || mb_strlen($name) > 80) {
                return knovix_error('Please enter your name.', 422);
            }
            $user_id = get_current_user_id();
            wp_update_user(['ID' => $user_id, 'display_name' => $name, 'first_name' => $name]);
            return knovix_current_user_response(get_user_by('id', $user_id));
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

<?php
if (!defined('ABSPATH')) exit;

/**
 * Phone + OTP signup/login, delivered via Fast2SMS.
 *
 * Flow:
 *   1. POST /auth/otp/request  { phone }        -> sends a 6-digit OTP by SMS
 *   2. POST /auth/otp/verify   { phone, otp, name? }
 *        -> first time for that phone: creates the account (name optional,
 *           falls back to "Customer"), logs them straight in
 *        -> existing phone: just logs them in
 *      Returns the same { id, name, email, role, token } shape auth.php's
 *      password login/signup already returns, so the frontend doesn't need
 *      two different response handlers.
 *
 * SETUP REQUIRED (in wp-config.php, above "That's all, stop editing!"):
 *
 *   define('KNOVIX_FAST2SMS_API_KEY', 'your-fast2sms-api-key');
 *
 * Get the key from https://www.fast2sms.com/dashboard/dev-api after
 * signing up — the "OTP" route works on their free/trial credits too,
 * so you can test this before topping up.
 *
 * OTPs and rate-limit counters are stored in WordPress transients (they
 * auto-expire — no custom DB table needed).
 */

const KNOVIX_OTP_TTL          = 5 * MINUTE_IN_SECONDS;   // how long an OTP is valid
const KNOVIX_OTP_RESEND_WAIT  = 45;                       // seconds between resend requests
const KNOVIX_OTP_MAX_ATTEMPTS = 5;                        // wrong-code attempts before the OTP is voided

/** Accepts 10-digit numbers, optionally prefixed with 0 / +91 / 91, returns a clean 10-digit string or null. */
function knovix_normalize_phone($raw) {
    $digits = preg_replace('/\D/', '', (string) $raw);
    if (strlen($digits) === 12 && str_starts_with($digits, '91')) $digits = substr($digits, 2);
    if (strlen($digits) === 11 && str_starts_with($digits, '0')) $digits = substr($digits, 1);
    if (strlen($digits) !== 10) return null;
    return $digits;
}

function knovix_otp_transient_key($phone) { return 'knovix_otp_' . $phone; }
function knovix_otp_cooldown_key($phone) { return 'knovix_otp_cd_' . $phone; }
function knovix_otp_attempts_key($phone) { return 'knovix_otp_attempts_' . $phone; }

/** Sends the OTP via Fast2SMS. Returns true/WP_Error. */
function knovix_send_otp_sms($phone, $otp) {
    if (!defined('KNOVIX_FAST2SMS_API_KEY') || !KNOVIX_FAST2SMS_API_KEY) {
        return knovix_error('SMS is not configured on the server yet (missing Fast2SMS API key).', 500);
    }

    $response = wp_remote_post('https://www.fast2sms.com/dev/bulkV2', [
        'timeout' => 10,
        'headers' => [
            'authorization' => KNOVIX_FAST2SMS_API_KEY,
            'Content-Type'  => 'application/x-www-form-urlencoded',
        ],
        'body' => [
            'route'            => 'otp',
            'variables_values' => $otp,
            'numbers'          => $phone,
            'flash'            => 0,
        ],
    ]);

    if (is_wp_error($response)) {
        return knovix_error('Could not reach the SMS provider. Please try again.', 502);
    }

    $code = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($code >= 300 || empty($body['return'])) {
        return knovix_error($body['message'][0] ?? 'Failed to send OTP SMS.', 502);
    }

    return true;
}

/** Find a WP user previously created via phone OTP, by their stored phone number. */
function knovix_find_user_by_phone($phone) {
    $users = get_users([
        'meta_key'   => '_knovix_phone',
        'meta_value' => $phone,
        'number'     => 1,
        'fields'     => 'all',
    ]);
    return $users[0] ?? null;
}

function knovix_register_otp_routes() {

    register_rest_route(KNOVIX_API_NS, '/auth/otp/request', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $phone = knovix_normalize_phone($req->get_param('phone'));
            if (!$phone) return knovix_error('Enter a valid 10-digit mobile number.', 422);

            // Rate-limit resends so one phone can't be used to spam itself.
            if (get_transient(knovix_otp_cooldown_key($phone))) {
                return knovix_error('Please wait before requesting another OTP.', 429);
            }

            $otp = (string) wp_rand(100000, 999999);

            $sent = knovix_send_otp_sms($phone, $otp);
            if (is_wp_error($sent)) return $sent;

            set_transient(knovix_otp_transient_key($phone), wp_hash_password($otp), KNOVIX_OTP_TTL);
            set_transient(knovix_otp_cooldown_key($phone), 1, KNOVIX_OTP_RESEND_WAIT);
            delete_transient(knovix_otp_attempts_key($phone));

            return [
                'success'    => true,
                'expiresIn'  => KNOVIX_OTP_TTL,
                'resendIn'   => KNOVIX_OTP_RESEND_WAIT,
            ];
        }
    ]);

    register_rest_route(KNOVIX_API_NS, '/auth/otp/verify', [
        'methods'  => 'POST',
        'permission_callback' => 'knovix_public_permission',
        'callback' => function (WP_REST_Request $req) {
            $phone = knovix_normalize_phone($req->get_param('phone'));
            $otp   = preg_replace('/\D/', '', (string) $req->get_param('otp'));
            $name  = sanitize_text_field((string) $req->get_param('name'));

            if (!$phone) return knovix_error('Enter a valid 10-digit mobile number.', 422);
            if (strlen($otp) !== 6) return knovix_error('Enter the 6-digit code sent to your phone.', 422);

            $stored_hash = get_transient(knovix_otp_transient_key($phone));
            if (!$stored_hash) return knovix_error('That code has expired. Please request a new one.', 410);

            $attempts = (int) get_transient(knovix_otp_attempts_key($phone));
            if ($attempts >= KNOVIX_OTP_MAX_ATTEMPTS) {
                delete_transient(knovix_otp_transient_key($phone));
                return knovix_error('Too many incorrect attempts. Please request a new code.', 429);
            }

            if (!wp_check_password($otp, $stored_hash)) {
                set_transient(knovix_otp_attempts_key($phone), $attempts + 1, KNOVIX_OTP_TTL);
                $left = KNOVIX_OTP_MAX_ATTEMPTS - $attempts - 1;
                return knovix_error("Incorrect code. {$left} attempt(s) left.", 401);
            }

            // Correct — consume the OTP so it can't be replayed.
            delete_transient(knovix_otp_transient_key($phone));
            delete_transient(knovix_otp_attempts_key($phone));

            $user = knovix_find_user_by_phone($phone);
            $is_new_user = false;

            if (!$user) {
                $is_new_user = true;
                // WordPress users need an email; phone-only customers get a
                // private placeholder address they can replace later from
                // their account page.
                $placeholder_email = $phone . '@phone.knovixgadgets.in';
                $login = 'knovix_' . $phone;
                if (username_exists($login)) $login .= '_' . wp_rand(100, 999);

                $user_id = wp_create_user($login, wp_generate_password(20), $placeholder_email);
                if (is_wp_error($user_id)) return knovix_error($user_id->get_error_message(), 400);

                $display_name = $name ?: ('Customer ' . substr($phone, -4));
                wp_update_user(['ID' => $user_id, 'display_name' => $display_name, 'first_name' => $display_name]);
                update_user_meta($user_id, '_knovix_phone', $phone);
                update_user_meta($user_id, 'billing_phone', $phone);

                $user = get_user_by('id', $user_id);
            }

            $token = knovix_issue_token($user->ID);
            return array_merge(
                knovix_current_user_response($user),
                ['token' => $token, 'phone' => $phone, 'isNewUser' => $is_new_user]
            );
        }
    ]);
}

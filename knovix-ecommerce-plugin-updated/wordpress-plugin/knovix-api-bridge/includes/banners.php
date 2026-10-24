<?php
if (!defined('ABSPATH')) exit;

/**
 * Home-page banners.
 *
 *   GET /wp-json/knovix/v1/banners
 *   -> [ { id, image, mobileImage, alt, link }, ... ]   (already ordered, active only)
 *
 * Managed in wp-admin under  WooCommerce > Knovix Banners  (add / reorder / hide /
 * change link, using the normal media library). Until the owner saves that page the
 * three banners shipped inside this plugin (assets/banners/) are served, so the
 * storefront has real banners from the first request.
 */

const KNOVIX_BANNERS_OPTION = 'knovix_home_banners';

/** The banners bundled with the plugin (all 2:1, 1600px + 800px WebP). */
function knovix_default_banner_rows() {
    $base = plugins_url('assets/banners/', KNOVIX_PLUGIN_FILE);
    return [
        [
            'attachment_id' => 0,
            'url'           => $base . 'knovix-banner-1.webp',
            'mobile_url'    => $base . 'knovix-banner-1-sm.webp',
            'link'          => '/shop',
            'alt'           => 'Smart Gadgets - Upgrade Your Everyday: smart watches, fast charging and everyday accessories',
            'active'        => true,
        ],
        [
            'attachment_id' => 0,
            'url'           => $base . 'knovix-banner-2.webp',
            'mobile_url'    => $base . 'knovix-banner-2-sm.webp',
            'link'          => '/shop',
            'alt'           => 'Premium Audio - Sound That Moves With You: Marshall earbuds',
            'active'        => true,
        ],
        [
            'attachment_id' => 0,
            'url'           => $base . 'knovix-banner-3.webp',
            'mobile_url'    => $base . 'knovix-banner-3-sm.webp',
            'link'          => '/shop',
            'alt'           => 'Premium Gadgets for a Smarter Tomorrow: power banks, mice and phone stands',
            'active'        => true,
        ],
    ];
}

/** Saved rows, or the built-in ones when the owner has never saved the banner page. */
function knovix_banner_rows() {
    $saved = get_option(KNOVIX_BANNERS_OPTION, null);
    return is_array($saved) ? $saved : knovix_default_banner_rows();
}

/** Rows -> the public API shape. */
function knovix_get_banners() {
    $out = [];
    foreach (knovix_banner_rows() as $i => $r) {
        if (empty($r['active'])) continue;

        $aid = (int) ($r['attachment_id'] ?? 0);
        if ($aid) {
            $image  = wp_get_attachment_image_url($aid, 'full');
            $mobile = wp_get_attachment_image_url($aid, 'medium_large') ?: $image;
        } else {
            $image  = (string) ($r['url'] ?? '');
            $mobile = (string) ($r['mobile_url'] ?? '') ?: $image;
        }
        if (!$image) continue; // image was deleted from the media library

        $out[] = [
            'id'          => 'banner-' . ($i + 1),
            'image'       => $image,
            'mobileImage' => $mobile,
            'alt'         => (string) ($r['alt'] ?? ''),
            'link'        => (string) ($r['link'] ?? ''),
        ];
    }
    return $out;
}

function knovix_register_banner_routes() {
    register_rest_route(KNOVIX_API_NS, '/banners', [
        'methods'             => 'GET',
        'permission_callback' => 'knovix_public_permission',
        'callback'            => function () {
            return knovix_get_banners();
        },
    ]);
}

/*
|--------------------------------------------------------------------------
| wp-admin page:  WooCommerce > Knovix Banners
|--------------------------------------------------------------------------
*/

add_action('admin_menu', function () {
    add_submenu_page(
        'woocommerce',
        'Knovix Banners',
        'Knovix Banners',
        'manage_woocommerce',
        'knovix-banners',
        'knovix_banners_admin_page'
    );
});

add_action('admin_enqueue_scripts', function ($hook) {
    if (strpos((string) $hook, 'knovix-banners') !== false) {
        wp_enqueue_media();
    }
});

/** Only a site path ("/shop") or an http(s) URL is accepted as a banner link. */
function knovix_clean_banner_link($v) {
    $v = trim((string) $v);
    if ($v === '') return '';
    if ($v[0] === '/' && strpos($v, '//') !== 0) return sanitize_text_field($v);
    if (preg_match('#^https?://#i', $v)) return esc_url_raw($v);
    return '';
}

function knovix_banner_row_html($r) {
    $r = wp_parse_args((array) $r, [
        'attachment_id' => 0,
        'url'           => '',
        'mobile_url'    => '',
        'link'          => '/shop',
        'alt'           => '',
        'active'        => true,
    ]);
    $preview = $r['attachment_id']
        ? wp_get_attachment_image_url((int) $r['attachment_id'], 'medium')
        : $r['url'];

    ob_start();
    ?>
    <div class="knovix-row">
        <img class="kp" src="<?php echo esc_url((string) $preview); ?>" alt="">
        <div class="kf">
            <input type="hidden" data-f="attachment_id" value="<?php echo (int) $r['attachment_id']; ?>">
            <input type="hidden" data-f="url" value="<?php echo esc_attr($r['url']); ?>">
            <input type="hidden" data-f="mobile_url" value="<?php echo esc_attr($r['mobile_url']); ?>">
            <p><label>Opens when clicked (e.g. /shop or https://...)<br>
                <input type="text" class="regular-text" data-f="link" value="<?php echo esc_attr($r['link']); ?>"></label></p>
            <p><label>Description (alt text)<br>
                <input type="text" class="large-text" data-f="alt" value="<?php echo esc_attr($r['alt']); ?>"></label></p>
            <p><label><input type="checkbox" data-f="active" value="1" <?php checked(!empty($r['active'])); ?>> Show on the home page</label></p>
        </div>
        <div class="ka">
            <button type="button" class="button kup" title="Move up">&uarr;</button>
            <button type="button" class="button kdown" title="Move down">&darr;</button>
            <button type="button" class="button kdel" title="Remove">Remove</button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function knovix_banners_admin_page() {
    if (!current_user_can('manage_woocommerce')) return;

    $rows = knovix_banner_rows();
    ?>
    <div class="wrap">
        <h1>Knovix Home Banners</h1>

        <?php if (!empty($_GET['updated'])) : ?>
            <div class="notice notice-success is-dismissible"><p>Banners saved. The storefront shows them immediately.</p></div>
        <?php endif; ?>

        <p>These slides appear in the home-page banner carousel, in this order. Use banner images that are
            <strong>2:1</strong> (for example 1600&times;800 px) so every slide has the same height.</p>

        <style>
            .knovix-row{display:flex;gap:16px;align-items:flex-start;background:#fff;border:1px solid #c3c4c7;border-radius:6px;padding:12px;margin:0 0 12px;max-width:980px}
            .knovix-row .kp{width:280px;height:140px;object-fit:cover;border-radius:4px;background:#f0f0f1;flex:none}
            .knovix-row .kf{flex:1}
            .knovix-row .kf p{margin:0 0 8px}
            .knovix-row .ka{display:flex;flex-direction:column;gap:6px}
        </style>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" id="knovix-banner-form">
            <input type="hidden" name="action" value="knovix_save_banners">
            <?php wp_nonce_field('knovix_save_banners'); ?>

            <div id="knovix-rows">
                <?php foreach ($rows as $r) { echo knovix_banner_row_html($r); } // phpcs:ignore WordPress.Security.EscapeOutput ?>
            </div>

            <template id="knovix-row-tpl"><?php echo knovix_banner_row_html(['link' => '/shop', 'active' => true]); // phpcs:ignore WordPress.Security.EscapeOutput ?></template>

            <p>
                <button type="button" class="button" id="knovix-add">Add banner image</button>
            </p>
            <p>
                <button type="submit" class="button button-primary">Save banners</button>
                <button type="submit" name="knovix_reset" value="1" class="button" onclick="return confirm('Go back to the 3 built-in Knovix banners?');">Reset to built-in banners</button>
            </p>
        </form>

        <script>
        (function () {
            var wrap = document.getElementById('knovix-rows');
            var form = document.getElementById('knovix-banner-form');
            var tpl  = document.getElementById('knovix-row-tpl');

            wrap.addEventListener('click', function (e) {
                var row = e.target.closest('.knovix-row');
                if (!row) return;
                if (e.target.classList.contains('kdel')) { row.remove(); }
                if (e.target.classList.contains('kup') && row.previousElementSibling) { wrap.insertBefore(row, row.previousElementSibling); }
                if (e.target.classList.contains('kdown') && row.nextElementSibling) { wrap.insertBefore(row.nextElementSibling, row); }
            });

            var frame;
            document.getElementById('knovix-add').addEventListener('click', function () {
                if (!frame) {
                    frame = wp.media({ title: 'Choose banner image(s)', button: { text: 'Add to banners' }, multiple: true, library: { type: 'image' } });
                    frame.on('select', function () {
                        frame.state().get('selection').each(function (att) {
                            var d = att.toJSON();
                            var row = document.importNode(tpl.content, true).querySelector('.knovix-row');
                            row.querySelector('[data-f="attachment_id"]').value = d.id;
                            row.querySelector('[data-f="alt"]').value = d.alt || d.title || '';
                            row.querySelector('.kp').src = (d.sizes && d.sizes.medium) ? d.sizes.medium.url : d.url;
                            wrap.appendChild(row);
                        });
                    });
                }
                frame.open();
            });

            // PHP needs indexed names (banners[0][link] ...); number the rows right before sending.
            form.addEventListener('submit', function () {
                wrap.querySelectorAll('.knovix-row').forEach(function (row, i) {
                    row.querySelectorAll('[data-f]').forEach(function (el) {
                        el.name = 'banners[' + i + '][' + el.getAttribute('data-f') + ']';
                    });
                });
            });
        })();
        </script>
    </div>
    <?php
}

add_action('admin_post_knovix_save_banners', function () {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('You are not allowed to do that.', 403);
    }
    check_admin_referer('knovix_save_banners');

    if (isset($_POST['knovix_reset'])) {
        delete_option(KNOVIX_BANNERS_OPTION);
    } else {
        $in   = isset($_POST['banners']) && is_array($_POST['banners']) ? wp_unslash($_POST['banners']) : [];
        $rows = [];
        foreach ($in as $r) {
            if (!is_array($r)) continue;
            $aid = absint($r['attachment_id'] ?? 0);
            $url = esc_url_raw((string) ($r['url'] ?? ''));
            if (!$aid && !$url) continue;
            $rows[] = [
                'attachment_id' => $aid,
                'url'           => $aid ? '' : $url,
                'mobile_url'    => $aid ? '' : esc_url_raw((string) ($r['mobile_url'] ?? '')),
                'link'          => knovix_clean_banner_link($r['link'] ?? ''),
                'alt'           => sanitize_text_field((string) ($r['alt'] ?? '')),
                'active'        => !empty($r['active']),
            ];
        }
        update_option(KNOVIX_BANNERS_OPTION, $rows, false);
    }

    wp_safe_redirect(add_query_arg(['page' => 'knovix-banners', 'updated' => '1'], admin_url('admin.php')));
    exit;
});

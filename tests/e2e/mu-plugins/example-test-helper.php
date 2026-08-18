<?php

/**
 * MU-Plugin: {{PLUGIN_NAME}} E2E Test Helper
 *
 * Renders the example block on the front page when the query parameter
 * {{PLUGIN_SLUG}}-test is present. Only active in wp-env environments.
 */

declare(strict_types=1);

add_action('template_redirect', static function (): void {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (!isset($_GET['{{PLUGIN_SLUG}}-test'])) {
        return;
    }

    add_filter(
        'the_content',
        static function (string $content): string {
            $block = do_blocks('<!-- wp:{{PLUGIN_SLUG}}/example {"label":"Clicks"} /-->');

            return $block . $content;
        }
    );
});

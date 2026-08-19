<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Integration;

/*
 * The bootstrap installs WordPress and activates this plugin, so the modules
 * already ran. The test asserts the result of the whole chain: the manifest of
 * the build directory becomes a registered block type.
 */

it('registers the example block', function (): void {
    $registry = \WP_Block_Type_Registry::get_instance();

    expect($registry->is_registered('{{PLUGIN_SLUG}}/example'))->toBeTrue();
})->skip(
    !is_readable(dirname(__DIR__, 3) . '/build/blocks-manifest.php'),
    'Run pnpm build before the integration tests.'
);

<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Integration;

use {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Example\BlockRegistrar;

it('hooks the registration into init', function (): void {
    BlockRegistrar::new()->init();

    expect(has_action('init'))->toBeTruthy();
});

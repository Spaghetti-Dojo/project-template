<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Integration;

use Inpsyde\Modularity\Package;

use function {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\package;

it('builds the package of the plugin', function (): void {
    expect(package())->toBeInstanceOf(Package::class);
});

it('always returns the same instance', function (): void {
    expect(package())->toBe(package());
});

<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Unit;

use Brain\Monkey\Functions;
use Inpsyde\Modularity\Module\ExecutableModule;
use Psr\Container\ContainerInterface;
use {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Example\Module;

it('is an executable module', function (): void {
    expect(Module::new())->toBeInstanceOf(ExecutableModule::class);
});

it('registers the block registrar on init', function (): void {
    Functions\expect('add_action')
        ->once()
        ->with('init', \Mockery::type('callable'));

    $container = \Mockery::mock(ContainerInterface::class);

    expect(Module::new()->run($container))->toBeTrue();
});

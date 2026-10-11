<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests;

use Brain\Monkey;

/*
 * Unit tests run against Brain Monkey. No WordPress is loaded.
 *
 * Integration tests run against a real WordPress. The bootstrap file
 * tests/bootstrap-integration.php installs it and activates this plugin, so
 * the integration suite needs no setup here.
 */
uses()
    ->beforeEach(function (): void {
        Monkey\setUp();
    })
    ->afterEach(function (): void {
        Monkey\tearDown();
        \Mockery::close();
    })
    ->in('unit');

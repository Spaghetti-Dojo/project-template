<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests;

use Brain\Monkey;

/*
 * Unit tests run against Brain Monkey. No WordPress is loaded.
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

/*
 * Integration tests run against a real WordPress on SQLite, through WorDBless.
 */
pest()
    ->extends(WpTestCase::class)
    ->in('integration');

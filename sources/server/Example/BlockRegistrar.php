<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Example;

/**
 * Registers every block of the build directory through the generated manifest.
 *
 * @internal
 */
final readonly class BlockRegistrar
{
    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function init(): void
    {
        add_action('init', $this->register(...));
    }

    private function register(): void
    {
        $buildDir = dirname(__DIR__, 3) . '/build';

        if (!is_dir($buildDir)) {
            return;
        }

        wp_register_block_types_from_metadata_collection(
            $buildDir,
            $buildDir . '/blocks-manifest.php'
        );
    }
}

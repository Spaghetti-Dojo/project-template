<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Blocks;

/**
 * Registers every block of the build directory through the generated manifest.
 *
 * The manifest keys are the directory names of the blocks, so the collection
 * path must be the parent directory of the blocks, not the build directory.
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
        $blocksDir = $buildDir . '/blocks';
        $manifest = $buildDir . '/blocks-manifest.php';

        if (!is_dir($blocksDir) || !is_readable($manifest)) {
            return;
        }

        wp_register_block_types_from_metadata_collection($blocksDir, $manifest);
    }
}

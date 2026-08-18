<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests;

use WorDBless\Sqlite;

class InstallWpDropIn
{
    private const array PATHS = [
        'sources' => [
            'dbless-wpdb.php' => 'vendor/automattic/wordbless/src/dbless-wpdb.php',
            'sqlite-database-integration' => 'vendor/automattic/wordbless/third-party/sqlite-database-integration',
        ],
        'targets' => [
            'themes' => 'vendor/roots/wordpress-no-content/wp-content/themes',
            'wp-content' => 'vendor/roots/wordpress-no-content/wp-content',
            'db.php' => 'vendor/roots/wordpress-no-content/wp-content/db.php',
            'sqlite-plugin-dir' => 'vendor/roots/wordpress-no-content/wp-content/plugins/wp-sqlite-integration',
        ],
    ];

    public static function copy(): void
    {
        self::createDirIfNotExists(self::PATHS['targets']['wp-content']);
        self::createDirIfNotExists(self::PATHS['targets']['themes']);
        self::createDirIfNotExists(self::PATHS['targets']['sqlite-plugin-dir']);

        copy(
            self::PATHS['sources']['dbless-wpdb.php'],
            self::PATHS['targets']['db.php'],
        );

        $sourceDir = self::PATHS['sources']['sqlite-database-integration'];
        if (is_dir($sourceDir)) {
            self::recursiveCopy($sourceDir, self::PATHS['targets']['sqlite-plugin-dir']);
        }

        WpLoad::load();
        Sqlite::init();
    }

    private static function recursiveCopy(string $src, string $dst): void
    {
        if (!is_dir($src)) {
            return;
        }
        if (!is_dir($dst)) {
            @mkdir($dst, 0777, true);
        }

        $directoryIterator = new \RecursiveDirectoryIterator(
            $src,
            \FilesystemIterator::SKIP_DOTS
        );
        $iterator = new \RecursiveIteratorIterator(
            $directoryIterator,
            \RecursiveIteratorIterator::SELF_FIRST
        );

        self::iterateItems($iterator, $dst);
    }

    /**
     * @param \RecursiveIteratorIterator<\RecursiveDirectoryIterator> $iterator
     */
    private static function iterateItems(\RecursiveIteratorIterator $iterator, string $dst): void
    {
        foreach ($iterator as $item) {
            $innerIterator = $iterator->getInnerIterator();
            assert($innerIterator instanceof \RecursiveDirectoryIterator);
            $targetPathName = $dst . DIRECTORY_SEPARATOR . $innerIterator->getSubPathName();
            $item instanceof \SplFileInfo and self::copyContent($item, $targetPathName);
        }
    }

    private static function copyContent(\SplFileInfo $item, string $targetPathName): void
    {
        if ($item->isDir()) {
            !is_dir($targetPathName) and self::createDirIfNotExists($targetPathName);
            return;
        }

        copy($item->getPathname(), $targetPathName);
    }

    private static function createDirIfNotExists(string $path): void
    {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
    }
}

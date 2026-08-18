<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests;

/**
 * Loads WorDBless
 */
class WpLoad
{
    public static function load(string $requestUri = '/'): void
    {
        defined('ABSPATH') or define('ABSPATH', dirname(__DIR__) . '/vendor/roots/wordpress-no-content/');
        defined('WP_REPAIRING') or define('WP_REPAIRING', true);
        defined('DB_ENGINE') or define('DB_ENGINE', 'sqlite');
        defined('WP_CONTENT_DIR') or define('WP_CONTENT_DIR', ABSPATH . 'wp-content');
        defined('WP_CONTENT_URL') or define('WP_CONTENT_URL', 'https://anything.example/wp-content');
        defined('UPLOADS') or define('UPLOADS', 'wp-content/uploads');
        defined('WP_USE_THEMES') or define('WP_USE_THEMES', true);

        $_SERVER['SERVER_NAME'] = 'anything.example';
        $_SERVER['HTTP_HOST'] = 'anything.example';
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = $requestUri;
        $_SERVER['PHP_SELF'] = '/index.php';
        $_SERVER['SCRIPT_NAME'] = '/index.php';
        $_SERVER['SCRIPT_FILENAME'] = ABSPATH . 'index.php';
        $_SERVER['QUERY_STRING'] = '';

        file_exists(ABSPATH . UPLOADS) or mkdir(ABSPATH . UPLOADS);

        // phpcs:disable Inpsyde.CodeQuality.VariablesName.SnakeCaseVar global $table_prefix;
        global $table_prefix;
        $table_prefix = 'wp_';
        // phpcs:enable Inpsyde.CodeQuality.VariablesName.SnakeCaseVar require_once ABSPATH . 'wp-includes/plugin.php';

        require_once ABSPATH . 'wp-includes/plugin.php';

        defined('DISABLE_WP_CRON') or define('DISABLE_WP_CRON', true);

        require_once ABSPATH . 'wp-settings.php';
        require_once ABSPATH . 'wp-admin/includes/admin.php';
    }
}

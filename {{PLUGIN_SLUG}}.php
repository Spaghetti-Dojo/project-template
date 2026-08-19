<?php

/**
 * Plugin Name: {{PLUGIN_NAME}}
 * Description: {{PLUGIN_DESCRIPTION}}
 * Version: 0.1.0
 * Requires at least: 6.9
 * Requires PHP: 8.4
 * Text Domain: {{TEXT_DOMAIN}}
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}
 */

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}};

defined('ABSPATH') || exit;

function autoload(string $projectRoot): void
{
    $autoloadFile = "{$projectRoot}/vendor/autoload.php";
    if (!\is_readable($autoloadFile)) {
        return;
    }
    require_once $autoloadFile;
}

autoload(__DIR__);

add_action(
    'plugins_loaded',
    static function (): void {
        package()
            ->addModule(Blocks\Module::new())
            ->boot();
    }
);

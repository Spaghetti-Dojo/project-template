<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}};

use Inpsyde\Modularity;

/**
 * The package of the plugin.
 *
 * The function always returns the same instance. Third parties can call it to
 * add their own modules, or to read the container of the plugin.
 *
 * Example:
 *
 *     add_action('plugins_loaded', static function (): void {
 *         $package = package();
 *         $package->addModule(MyOwn\Module::new($package));
 *     }, 5);
 *
 * The module can read the properties of the plugin through
 * `$package->properties()`, which give the base path and the base URL.
 */
function package(): Modularity\Package
{
    /** @var Modularity\Package|null $package */
    static $package = null;

    if (!$package) {
        $pluginFilePath = dirname(__DIR__) . '/{{PLUGIN_SLUG}}.php';
        $properties = Modularity\Properties\PluginProperties::new($pluginFilePath);
        $package = Modularity\Package::new($properties);
    }

    return $package;
}

<?php

declare(strict_types=1);

use Syde\WpPhpUnitIntegration\Bootstrap;

$packagePath = dirname(__DIR__);
$vendorPath = "{$packagePath}/vendor";

if (!realpath($vendorPath)) {
    die('Install the Composer dependencies before you run the tests.');
}

require_once "{$vendorPath}/autoload.php";

Bootstrap::init($packagePath);

unset($packagePath, $vendorPath);

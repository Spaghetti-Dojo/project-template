# Testing

This project has four test layers. Each layer has its own runner, its own
directory and its own naming rule.

| Layer | Runner | Files | Sees | Command |
| --- | --- | --- | --- | --- |
| PHP unit | Pest, Brain Monkey | `tests/unit/server/*Test.php` | no WordPress | `composer test:unit` |
| PHP integration | Pest, real WordPress | `tests/integration/server/*Test.php` | a full WordPress with this plugin active | `composer test:integration` |
| Client unit | Jest, through `wp-scripts` | `tests/unit/client/*.test.ts` | no browser, no WordPress | `pnpm test:unit` |
| End to end | Playwright, `wp-env` | `tests/e2e/specs/*.spec.ts` | a real browser on a real WordPress | `pnpm test:e2e` |

The suffix decides the runner on the client side. Jest collects `*.test.ts`
and ignores `*.spec.ts`. Playwright collects only `tests/e2e/specs`. The two
never pick up the same file.

Every command passes when its directory holds no test. Delete the examples of
this template without breaking the build.

## Which layer

Ask what the test must see:

- Only PHP logic, and you can replace every WordPress function with an
  expectation → **PHP unit**.
- The result of the WordPress lifecycle: a registered block, a filtered value,
  a stored option → **PHP integration**.
- A pure TypeScript function, a value object, a reducer → **client unit**.
- What the user sees or clicks in the browser → **end to end**.

Prefer the cheapest layer that can fail for the right reason. Do not write an
end to end test for logic that a unit test can cover.

## PHP unit tests

Brain Monkey replaces WordPress. No WordPress file is loaded, so every
WordPress function that the code calls must have an expectation. This layer is
fast and it isolates one class.

`tests/Pest.php` starts and stops Brain Monkey for you.

```php
<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Unit;

use Brain\Monkey\Functions;
use Psr\Container\ContainerInterface;
use {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Blocks\Module;

it('registers the block registrar on init', function (): void {
    Functions\expect('add_action')
        ->once()
        ->with('init', \Mockery::type('callable'));

    $container = \Mockery::mock(ContainerInterface::class);

    expect(Module::new()->run($container))->toBeTrue();
});
```

Rules:

- Namespace: `{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Unit`.
- Mirror the structure of `sources/server/` under `tests/unit/server/`.
- Assert the call, because there is no WordPress to produce a result.
- Use `Functions\when()` for a function that only needs a return value. Use
  `Functions\expect()` when the call itself is the behaviour.

## PHP integration tests

`tests/bootstrap-integration.php` runs once before the suite. It installs
WordPress into `vendor/wordpress/wordpress`, puts it on SQLite, creates
`wp-config.php`, symlinks this plugin into WordPress, activates it, loads
WordPress, and removes everything at the end.

Two consequences:

1. WordPress is already loaded and `init` already fired. The modules of the
   plugin already ran. Assert the **result**, never the registration call.
2. Never fire `do_action('init')` again. A second run registers everything
   twice.

```php
<?php

declare(strict_types=1);

namespace {{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Integration;

it('registers the example block', function (): void {
    $registry = \WP_Block_Type_Registry::get_instance();

    expect($registry->is_registered('{{PLUGIN_SLUG}}/example'))->toBeTrue();
})->skip(
    !is_readable(dirname(__DIR__, 3) . '/build/blocks-manifest.php'),
    'Run pnpm build before the integration tests.'
);
```

Rules:

- Namespace: `{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Tests\Integration`.
- There is no base class. Write plain Pest tests.
- Build the client first when the test reads the build directory. Skip the
  test when the directory is absent, as shown above.
- Create the state with the WordPress API: `wp_insert_post()`,
  `wp_insert_user()`, `wp_set_current_user()`, `update_option()`.
- Delete what you create. The database survives between the tests of one run.

Run the suite against another WordPress version:

```bash
WP_CORE_VERSION=6.8 composer test:integration
```

Known limit: the harness runs WP-CLI, and it treats any output on `stderr` as
a fatal error. On PHP 8.5 the bundled WP-CLI prints a deprecation, so the
bootstrap fails. Use PHP 8.4, the version of the CI and of `wp-env`.

## Client unit tests

`wp-scripts test-unit-js` runs Jest. It compiles TypeScript with no extra
configuration.

```ts
import { nextCount } from '../../../sources/client/blocks/example/counter';

describe( 'nextCount', () => {
	it( 'raises the count by one', () => {
		expect( nextCount( 1 ) ).toBe( 2 );
	} );
} );
```

The path has three levels, because the file sits in
`tests/unit/client/<name>.test.ts`.

Rules:

- The file name must end with `.test.ts`.
- Test pure functions, value objects and pure state changes.
- Do not test the Interactivity API store here. The store needs the runtime of
  WordPress and the DOM. Move the logic into a pure function, test the
  function here, and cover the wiring with an end to end test.
- `tests/unit/client/tsconfig.json` exists so that ESLint can type the test
  files. `pnpm lint:types` checks `sources` only, so a type error in a test
  file appears through `pnpm lint:scripts`.

## End to end tests

Playwright drives a real browser against the WordPress of `wp-env`. Docker
must run. `pnpm test:e2e` starts `wp-env` on its own, on
`http://localhost:8877`.

```ts
import { test, expect } from '@playwright/test';

test( 'increments the counter on click', async ( { page } ) => {
	await page.goto( '/?{{PLUGIN_SLUG}}-test=1' );

	const block = page.locator( '.wp-block-{{PLUGIN_SLUG}}-example' ).first();

	await block.locator( '.{{PLUGIN_SLUG}}-example__button' ).click();

	await expect(
		block.locator( '.{{PLUGIN_SLUG}}-example__value' )
	).toHaveText( '1' );
} );
```

Run `pnpm build` first. Playwright tests the build output, not the sources.

### Render a block that has no inserter

The example block sets `"inserter": false`, so you cannot add it from the
editor. Put a mu-plugin in `tests/e2e/mu-plugins/`. `.wp-env.json` maps that
directory into WordPress, so the file loads on every request.

```php
<?php

declare(strict_types=1);

add_action('template_redirect', static function (): void {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    if (!isset($_GET['{{PLUGIN_SLUG}}-test'])) {
        return;
    }

    add_filter(
        'the_content',
        static function (string $content): string {
            return do_blocks('<!-- wp:{{PLUGIN_SLUG}}/example /-->') . $content;
        }
    );
});
```

The query parameter keeps the helper inert on every other request, so one
mu-plugin can serve many specs.

### Artifacts

A failed test writes a trace, a screenshot and a video into `artifacts/`. The
`e2e` workflow uploads that directory when the job fails.

## What the CI runs

| Workflow | Tests |
| --- | --- |
| `qa.yml` | `composer cs`, `composer analysis`, PHP unit and PHP integration. It builds the client first. |
| `lint.yml` | ESLint, Stylelint, `tsc --noEmit`, client unit tests. |
| `e2e.yml` | Playwright, after `pnpm build` and `wp-env start`. |

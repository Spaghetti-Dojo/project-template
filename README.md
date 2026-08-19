# {{PLUGIN_NAME}}

{{PLUGIN_DESCRIPTION}}

## Template setup

This repository is a GitHub template. After you create your repository from it,
run the initializer once:

```bash
node bin/init.mjs
```

The script asks for the plugin name, the slug, the namespaces and the author.
It then replaces every token, renames the tokenized files, and removes itself.
Use `node bin/init.mjs --dry-run` to see the changes without writing them.

The tokens are:

| Token | Example |
| --- | --- |
| `{{PLUGIN_NAME}}` | My Plugin |
| `{{PLUGIN_SLUG}}` | my-plugin |
| `{{PLUGIN_DESCRIPTION}}` | A WordPress plugin. |
| `{{VENDOR_NAMESPACE}}` | SpaghettiDojo |
| `{{PLUGIN_NAMESPACE}}` | MyPlugin |
| `{{COMPOSER_NAME}}` | spaghetti-dojo/my-plugin |
| `{{NPM_NAME}}` | @spaghetti-dojo/my-plugin |
| `{{TEXT_DOMAIN}}` | my-plugin |
| `{{AUTHOR_NAME}}` | guido scialfa |
| `{{AUTHOR_EMAIL}}` | dev@guidoscialfa.com |
| `{{GITHUB_OWNER}}` | Spaghetti-Dojo |
| `{{GITHUB_REPO}}` | my-plugin |
| `{{CODEOWNER}}` | @widoz |

The template ships one example block. The block has `inserter: false`, so it
does not appear in the editor. It renders on the front end through
`do_blocks()` or through a template. See
`tests/e2e/mu-plugins/example-test-helper.php`.

To add a block, create one directory in `sources/client/blocks/`. It holds
every file of the block: `block.json`, `render.php`, `view.ts` and
`style.scss`. The `Blocks` module registers every block of the build
directory, so you do not need to change any PHP.

Remove `sources/client/blocks/example/` and the matching tests when you do not
need the example.

The `.claude/commands/opsx` commands need OpenSpec. Run `openspec init` if you
want to use them.

## Requirements

- PHP 8.4
- Node 24 and pnpm 10
- Composer 2
- Docker, for `wp-env`

## Install

```bash
composer install
pnpm install
pnpm build
```

## Development

Start the local WordPress and the watcher:

```bash
pnpm wp-env start
pnpm start
```

The site runs on `http://localhost:8877`.

## Tests

Unit tests run on Brain Monkey. No WordPress is loaded.

Integration tests run against a real WordPress, through
[syde/wp-phpunit-integration](https://github.com/inpsyde/wp-phpunit-integration).
The bootstrap file installs WordPress into `vendor/wordpress/wordpress`, puts
it on SQLite, symlinks this plugin into it and activates it. Composer installs
WordPress, so no other tool is needed.

Run the integration suite against another WordPress version:

```bash
WP_CORE_VERSION=6.8 composer test:integration
```

Run `pnpm build` before the integration suite. The block registration test
reads the build directory, and it skips itself when the directory is absent.

## Quality assurance

| Command | Purpose |
| --- | --- |
| `composer cs` | PHP coding standards |
| `composer cs:fix` | Fix the PHP coding standards |
| `composer analysis` | PHPStan, level 9 |
| `composer test:unit` | Pest unit tests |
| `composer test:integration` | Pest integration tests on a real WordPress |
| `composer qa` | Coding standards, analysis and tests |
| `pnpm lint:scripts` | ESLint |
| `pnpm lint:styles` | Stylelint |
| `pnpm lint:types` | TypeScript type check |
| `pnpm test:e2e` | Playwright end to end tests |

## Extend the plugin

`sources/package.php` exposes the package of the plugin through the
`package()` function. The function always returns the same instance, so a
third party can add its own module:

```php
add_action('plugins_loaded', static function (): void {
    \{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\package()->addModule(MyOwn\Module::new());
}, 5);
```

Add the module before the priority of the `boot()` call, which is 10.

## Layout

```
sources/package.php        The package factory. The public entry point.
sources/server/            PHP. One directory per module.
sources/server/Blocks/     The block module and the registrar.
sources/client/blocks/     One directory per block. All the files of a block.
sources/client/styles/     Shared SCSS.
tests/unit/                Unit tests. Brain Monkey. No WordPress.
tests/integration/         Integration tests. Real WordPress on SQLite.
tests/bootstrap-integration.php  Installs WordPress for the integration tests.
tests/e2e/                 Playwright specs and the mu-plugin helper.
build/                     Generated. Never edit it by hand.
```

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

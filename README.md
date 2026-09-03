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

There are four layers:

| Layer | Files | Command |
| --- | --- | --- |
| PHP unit, on Brain Monkey | `tests/unit/server/*Test.php` | `composer test:unit` |
| PHP integration, on a real WordPress | `tests/integration/server/*Test.php` | `composer test:integration` |
| Client unit, on Jest | `tests/unit/client/*.test.ts` | `pnpm test:unit` |
| End to end, on Playwright | `tests/e2e/specs/*.spec.ts` | `pnpm test:e2e` |

Every command passes when its directory holds no test, so you can delete the
examples of this template.

Read [docs/testing.md](docs/testing.md) before you write a test. It explains
each layer, when to use it, and the rules that apply to it.

## Quality assurance

| Command | Purpose |
| --- | --- |
| `composer cs` | PHP coding standards |
| `composer cs:fix` | Fix the PHP coding standards |
| `composer analysis` | PHPStan, level 9 |
| `composer test:unit` | Pest unit tests |
| `composer test:integration` | Pest integration tests on a real WordPress |
| `pnpm test:unit` | Jest unit tests of the client |
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
    $package = \{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\package();
    $package->addModule(MyOwn\Module::new($package->properties()));
}, 5);
```

Add the module before the priority of the `boot()` call, which is 10.

The module gets the properties of the plugin, so it can read the base path,
the base URL and the other data of the plugin:

```php
use Inpsyde\Modularity\Properties\Properties;

final class Module implements ExecutableModule
{
    use ModuleClassNameIdTrait;

    public static function new(Properties $properties): self
    {
        return new self($properties);
    }

    private function __construct(private Properties $properties)
    {
    }

    public function run(ContainerInterface $container): bool
    {
        $assetsUrl = $this->properties->baseUrl() . 'build/';
        $templatePath = $this->properties->basePath() . 'templates/';

        return true;
    }
}
```

## Layout

```
sources/package.php        The package factory. The public entry point.
sources/server/            PHP. One directory per module.
sources/server/Blocks/     The block module and the registrar.
sources/client/blocks/     One directory per block. All the files of a block.
sources/client/styles/     Shared SCSS.
tests/unit/server/         PHP unit tests. Brain Monkey. No WordPress.
tests/unit/client/         Client unit tests. Jest.
tests/integration/server/  PHP integration tests. Real WordPress on SQLite.
tests/e2e/                 Playwright specs and the mu-plugins of the tests.
tests/bootstrap-integration.php  Installs WordPress for the integration tests.
build/                     Generated. Never edit it by hand.
```

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

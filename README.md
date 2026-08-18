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

Remove `sources/server/Example/`, `sources/client/example/` and the matching
tests when you do not need the example.

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

## Quality assurance

| Command | Purpose |
| --- | --- |
| `composer cs` | PHP coding standards |
| `composer cs:fix` | Fix the PHP coding standards |
| `composer analysis` | PHPStan, level 9 |
| `composer test:unit` | Pest unit tests |
| `composer test:integration` | Pest integration tests on WorDBless |
| `composer qa` | Coding standards, analysis and tests |
| `pnpm lint:scripts` | ESLint |
| `pnpm lint:styles` | Stylelint |
| `pnpm lint:types` | TypeScript type check |
| `pnpm test:e2e` | Playwright end to end tests |

## Layout

```
sources/server/     PHP. One directory per module.
sources/client/     TypeScript and SCSS. One directory per block.
tests/unit/         Unit tests. Brain Monkey. No WordPress.
tests/integration/  Integration tests. Real WordPress on SQLite.
tests/e2e/          Playwright specs and the mu-plugin helper.
build/              Generated. Never edit it by hand.
```

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

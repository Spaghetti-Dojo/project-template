# WordPress Plugin Template — Design

Date: 2026-08-18
Status: approved

## Goal

Provide a GitHub template repository for WordPress plugins. The template
extracts the build setup, the QA setup and the test setup of the `tosuto`
project. A new plugin starts from this template, runs one init script, and
gets a working plugin with one example block.

## Source

`/Volumes/Dev/mine/tosuto`. The template takes the configuration, the test
scaffolding, the `.claude` directory and a reduced example of the block. It
does not take `openspec/`, `docs/`, `website/`, the docs workflow, build
output, lock files or vendor directories.

## Repository layout

```
.claude/                        agents, commands/opsx, hooks/qa.sh, rules,
                                skills, settings.json, CLAUDE.md
.github/
  CODEOWNERS                    @Spaghetti-Dojo/maintainers
  git-commit-instructions.md
  workflows/{qa.yml,lint.yml,e2e.yml}
bin/init.mjs                    token replacement, removes itself
sources/
  package.php                   the package() factory, the public entry point
  server/Blocks/{Module.php,BlockRegistrar.php}
  client/blocks/example/{block.json,render.php,view.ts,types.ts,style.scss}
  client/styles/mixins/_units.scss
tests/
  {Pest.php,bootstrap-integration.php}
  unit/server/            PHP unit tests. Empty in the template.
  unit/client/            client unit tests. Empty in the template.
  integration/server/PackageTest.php
  e2e/{specs,mu-plugins,tsconfig.json}
{{PLUGIN_SLUG}}.php             plugin bootstrap
composer.json package.json .wp-env.json
phpcs.xml phpstan.neon phpunit.xml phpunit-integration.xml
tsconfig.json playwright.config.ts
.editorconfig .gitignore .prettierrc.js .prettierignore .eslintrc.json
.eslintignore .stylelintrc.json .stylelintignore .browserslistrc
babel.config.js LICENSE README.md
```

## Tokens

| Token | Example value |
| --- | --- |
| `{{PLUGIN_NAME}}` | My Plugin |
| `{{PLUGIN_SLUG}}` | my-plugin |
| `{{PLUGIN_DESCRIPTION}}` | A WordPress plugin. |
| `{{VENDOR_NAMESPACE}}` | SpaghettiDojo |
| `{{PLUGIN_NAMESPACE}}` | MyPlugin |
| `{{COMPOSER_NAME}}` | spaghetti-dojo/my-plugin |
| `{{NPM_NAME}}` | @spaghetti-dojo/my-plugin |
| `{{TEXT_DOMAIN}}` | my-plugin |
| `{{AUTHOR_NAME}}` | Jane Doe |
| `{{AUTHOR_EMAIL}}` | jane@example.com |
| `{{GITHUB_OWNER}}` | Spaghetti-Dojo |
| `{{GITHUB_REPO}}` | my-plugin |

The PHP namespace is `{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}`.

## Init script

`bin/init.mjs` runs on Node with no dependencies. It uses
`node:readline/promises`.

Steps:

1. Ask each value. Derive the defaults from the directory name.
2. Print a summary. Ask for confirmation.
3. Replace the tokens in every text file that git tracks.
4. Rename `{{PLUGIN_SLUG}}.php` to the plugin slug.
5. Remove `bin/`, `docs/superpowers/` and the "Template setup" section of
   `README.md`.
6. Print the next steps.

The `--dry-run` flag prints the planned changes and writes nothing.

## Example code

The `Blocks` server module is not specific to one block. It registers every
block of `build/blocks` through the generated manifest. Every file of a block lives in one
directory under `sources/client/blocks/`, the render template included.
`wp-scripts` copies the template into the build directory.

The manifest keys are the directory names of the blocks. The collection path
must therefore be `build/blocks`, not `build`. The client side has one Interactivity
API store in `view.ts` and one `style.scss`.

The block has no editor script. `@wordpress/blocks` and
`@wordpress/block-editor` ship no TypeScript types, and the template runs
`tsc --noEmit` in CI. The block therefore uses `inserter: false`, as `tosuto`
does. It renders through `do_blocks()` or through a template.

The template ships one integration test, for the package factory. It does not
ship example tests for the block, because every project deletes them. Every
test command passes on an empty directory, through
`--do-not-fail-on-empty-test-suite` for Pest, `--passWithNoTests` for Jest and
`--pass-with-no-tests` for Playwright.

`docs/testing.md` replaces the example tests. It documents the four layers,
the choice between them, and the rules of each one.

## Test harness

There are four layers: PHP unit, PHP integration, client unit and end to end.
`docs/testing.md` is the reference.

Unit tests run on Brain Monkey.

Integration tests run on a real WordPress, through
`syde/wp-phpunit-integration`. `tests/bootstrap-integration.php` installs
WordPress into `vendor/wordpress/wordpress`, puts it on SQLite, symlinks the
plugin into it and activates it. `phpunit-integration.xml` declares the
bootstrap, and `composer test:integration` runs Pest with that file.

Composer installs WordPress through `roots/wordpress`, and the root
`composer.json` declares the wpackagist repository, because
`syde/wp-phpunit-integration` needs `wpackagist-plugin/sqlite-database-integration`
and Composer reads repositories only from the root package.

Known limit: on PHP 8.5 the bundled WP-CLI phar prints a deprecation to
stderr, and the package treats any stderr output as a fatal error. Use PHP
8.4, which is the version of the CI and of `wp-env`.

## Public entry point

`sources/package.php` declares the function `package()` in the namespace of
the plugin. The function builds the `Inpsyde\Modularity\Package` once and
returns the same instance on every call. Composer loads the file through the
`autoload.files` entry.

The plugin bootstrap calls `package()`, adds the `Example` module, and boots
the package on `plugins_loaded`. A third party can call `package()` to add its
own module or to read the container.

## CI

- `qa.yml` — PHP 8.4 with `pdo_sqlite`, `pnpm build`, then `composer cs`,
  `composer analysis` and `composer tests`. The build must run first, because
  the integration test reads the build directory.
- `lint.yml` — `pnpm lint:scripts`, `pnpm lint:styles`, `tsc --noEmit`, and
  the client unit tests.
- `e2e.yml` — build, `wp-env start`, Playwright, artifact upload on failure.

## Git

One local repository on `main`. One commit per logical group. No push.

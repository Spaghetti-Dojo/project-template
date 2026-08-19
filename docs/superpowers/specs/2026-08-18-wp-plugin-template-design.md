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
  CODEOWNERS                    {{CODEOWNER}}
  git-commit-instructions.md
  workflows/{qa.yml,lint.yml,e2e.yml}
bin/init.mjs                    token replacement, removes itself
sources/
  package.php                   the package() factory, the public entry point
  server/Blocks/{Module.php,BlockRegistrar.php}
  server/Blocks/Example/render.php
  client/blocks/example/{block.json,view.ts,types.ts,style.scss}
  client/styles/mixins/_units.scss
tests/
  {Pest.php,WpTestCase.php,WpLoad.php,InstallWpDropIn.php}
  unit/server/BlocksModuleTest.php
  integration/server/{BlockRegistrarTest.php,PackageTest.php}
  e2e/{specs/example.spec.ts,mu-plugins/example-test-helper.php,tsconfig.json}
{{PLUGIN_SLUG}}.php             plugin bootstrap
composer.json package.json .wp-env.json
phpcs.xml phpstan.neon phpunit.xml tsconfig.json playwright.config.ts
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
| `{{AUTHOR_NAME}}` | guido scialfa |
| `{{AUTHOR_EMAIL}}` | dev@guidoscialfa.com |
| `{{GITHUB_OWNER}}` | Spaghetti-Dojo |
| `{{GITHUB_REPO}}` | my-plugin |
| `{{CODEOWNER}}` | @widoz |

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
block of `build/blocks` through the generated manifest. The example block
renders through `sources/server/Blocks/Example/render.php`.

The manifest keys are the directory names of the blocks. The collection path
must therefore be `build/blocks`, not `build`. The client side has one Interactivity
API store in `view.ts` and one `style.scss`.

The block has no editor script. `@wordpress/blocks` and
`@wordpress/block-editor` ship no TypeScript types, and the template runs
`tsc --noEmit` in CI. The block therefore uses `inserter: false`, as `tosuto`
does. It renders through `do_blocks()` or through a template.

The example gives each QA command real input:

- one unit test for the module,
- one integration test for the block registration,
- one Playwright spec for the rendered block.

## Public entry point

`sources/package.php` declares the function `package()` in the namespace of
the plugin. The function builds the `Inpsyde\Modularity\Package` once and
returns the same instance on every call. Composer loads the file through the
`autoload.files` entry.

The plugin bootstrap calls `package()`, adds the `Example` module, and boots
the package on `plugins_loaded`. A third party can call `package()` to add its
own module or to read the container.

## CI

- `qa.yml` — PHP 8.4, `composer cs`, `composer analysis`, `composer tests`.
- `lint.yml` — `pnpm lint:scripts`, `pnpm lint:styles`, `tsc --noEmit`.
- `e2e.yml` — build, `wp-env start`, Playwright, artifact upload on failure.

## Git

One local repository on `main`. One commit per logical group. No push.

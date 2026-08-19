# Router decision tree

This project is one WordPress plugin. There is no repo kind to classify.
Route by the intent of the request.

## Route by user intent (keywords)

- **Interactivity API / data-wp-* directives / @wordpress/interactivity / viewScriptModule**
  - Route → `wp-interactivity-api`.
- **Abilities API / wp_register_ability / wp-abilities/v1 / @wordpress/abilities**
  - Route → `wp-abilities-api`.
- **Blocks / block.json / registerBlockType / attributes / save serialization**
  - Route → `wp-block-development`.
- **Plugins / hooks / activation hook / uninstall / Settings API / admin pages**
  - Route → `wp-plugin-development`.
- **REST endpoint / register_rest_route / permission_callback**
  - Route → `wp-rest-api`.
- **WP-CLI / wp-cli.yml / commands**
  - Route → `wp-wpcli-and-ops`.
- **Build tooling / @wordpress/scripts / pnpm scripts / wp-env / Playwright**
  - Route → `wp-block-development`, file `references/tooling-and-testing.md`.
- **PHPStan / static analysis / phpstan.neon / phpstan-baseline.neon**
  - Route → `wp-phpstan`.
- **Performance / caching / query profiling / editor slowness**
  - Route → `wp-performance`.
- **Security / nonces / capabilities / sanitization/escaping / uploads**
  - Route → `wp-plugin-development`.

## Guardrails (always)

- This project is a plugin. It uses Composer and pnpm. Never suggest npm or npx.
- Prefer existing lint/test scripts if present.
- If version constraints aren’t detectable, ask for target WP core and PHP versions.

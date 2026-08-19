# {{PLUGIN_NAME}} Project Directives

## Plans and Open Spec Implementation Flow Constraints

1. When executing a plan or implementing tasks of a spec, always stop at each step / task and ask for confirmation before proceeding to the next one.

## Project Layout

- `sources/server/` — PHP, namespace `{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}`, one directory per module.
- `sources/client/blocks/` — one directory per block. It holds every file of the block: `block.json`, `render.php`, `view.ts` and `style.scss`.
- `sources/server/Blocks/` — the block module and the registrar. Not specific to one block.
- `tests/unit/server/`, `tests/integration/server/` — Pest tests.
- `tests/e2e/specs/` — Playwright specs.
- `build/` — generated. Never edit it by hand.

## Quality Assurance

Run `composer qa` for PHP. Run `pnpm lint:scripts` and `pnpm lint:styles` for the client side.
The `Stop` hook runs `.claude/hooks/qa.sh` automatically.

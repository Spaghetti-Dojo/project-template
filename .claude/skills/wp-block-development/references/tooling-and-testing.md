# Tooling and testing

Use `pnpm` and `composer`. Never use `npm` or `npx` in this project.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build the blocks into `build/`. Run it after every change. |
| `pnpm start` | Build and watch. |
| `pnpm lint:scripts` | ESLint. |
| `pnpm lint:styles` | Stylelint. |
| `pnpm lint:types` | `tsc --noEmit` over `sources`. |
| `pnpm wp-env start` | Start the local WordPress on port 8877. |
| `pnpm test:e2e` | Playwright specs of `tests/e2e/specs/`. |
| `composer cs` | PHP coding standards. It covers `render.php`. |
| `composer analysis` | PHPStan, level 9. |
| `composer tests` | Pest unit and integration tests. |
| `composer qa` | The three PHP commands above. |

`pnpm test:e2e` starts `wp-env` on its own. It needs Docker.

## Verification of a block change

1. `pnpm build`.
2. Confirm the output in `build/blocks/<name>/`.
3. `pnpm lint:scripts`, `pnpm lint:styles`, `pnpm lint:types`.
4. `composer cs` and `composer analysis` when you touched `render.php`.
5. `pnpm test:e2e` for the front end behaviour.
6. Manual: insert or render the block, reload, and confirm no "Invalid block".

## Upstream references

- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/

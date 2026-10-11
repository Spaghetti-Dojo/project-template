---
name: wp-block-development
description: "Use when developing WordPress (Gutenberg) blocks in this project: block.json metadata, the block directory contract of sources/client/blocks, collection registration through the generated manifest, attributes/serialization, supports, dynamic rendering (render.php), deprecations/migrations, viewScript vs viewScriptModule, and the pnpm build and test workflow."
---

# WP Block Development

## When to use

Use this skill for block work such as:

- creating a new block, or updating an existing one
- changing `block.json` (scripts/styles/supports/attributes/render/viewScriptModule)
- fixing “block invalid / not saving / attributes not persisting”
- adding dynamic rendering (`render.php` / `render_callback`)
- block deprecations and migrations (`deprecated` versions)
- build tooling for blocks (`@wordpress/scripts`, `wp-env`)

## Project conventions

This project has a fixed layout. It overrides any upstream advice.

- Every file of a block lives in one directory under `sources/client/blocks/`,
  `render.php` included.
- `sources/server/Blocks/` holds the module and the registrar. Both are
  generic. Never put block specific PHP there.
- A new block needs no PHP. The registrar registers the whole collection of
  `build/blocks` through the generated manifest.
- Do not use `@wordpress/create-block`. It scaffolds a `src/` directory and
  its own plugin file, which do not match this layout.
- Use `pnpm`, never `npm` or `npx`.

## Inputs required

- The block name, and the block root if it exists already.
- Target WordPress version range, especially for `viewScriptModule`.

## Procedure

### 0) Locate the blocks

Run the deterministic scan:

- `node .claude/skills/wp-block-development/scripts/list_blocks.mjs`

It prints the root, the name and the metadata fields of every block.

### 1) Create a new block (if needed)

Create one directory under `sources/client/blocks/` and add `block.json`.

Read:
- `references/creating-new-blocks.md`

Then re-run the scan and confirm the new block root.

### 2) Ensure apiVersion 3 (WordPress 6.9+)

WordPress 6.9 enforces `apiVersion: 3` in the block.json schema. Blocks with apiVersion 2 or lower trigger console warnings when `SCRIPT_DEBUG` is enabled.

**Why this matters:**
- WordPress 7.0 will run the post editor in an iframe regardless of block apiVersion.
- apiVersion 3 ensures your block works correctly inside the iframed editor (style isolation, viewport units, media queries).

**Migration:** Changing from version 2 to 3 is usually as simple as updating the `apiVersion` field in `block.json`. However:
- Test in a local environment with the iframe editor enabled.
- Ensure any style handles are included in `block.json` (styles missing from the iframe won't apply).
- Third-party scripts attached to a specific `window` may have scoping issues.

Read:
- `references/block-json.md` (apiVersion and schema details)

### 3) Pick the right block model

- **Static block** (markup saved into post content): implement `save()`; keep attributes serialization stable.
- **Dynamic block** (server-rendered): use `render` in `block.json` (or `render_callback` in PHP) and keep `save()` minimal or `null`.
- **Interactive frontend behavior**:
  - Prefer `viewScriptModule` for modern module-based view scripts where supported.
  - If you're working primarily on `data-wp-*` directives or stores, also use `wp-interactivity-api`.

### 4) Update `block.json` safely

Make changes in the block’s `block.json`, then confirm registration matches metadata.

For field-by-field guidance, read:
- `references/block-json.md`

Common pitfalls:

- changing `name` breaks compatibility (treat it as stable API)
- changing saved markup without adding `deprecated` causes “Invalid block”
- adding attributes without defining source/serialization correctly causes “attribute not saving”

### 5) Registration

You do not register the block. `Blocks\BlockRegistrar` registers the whole
collection of `build/blocks` on `init`. Run `pnpm build` and the block is
registered.

Read this before you change the directory layout, or when a block does not
appear:
- `references/registration.md`

### 6) Implement edit/save/render patterns

Follow wrapper attribute best practices:

- Editor: `useBlockProps()`
- Static save: `useBlockProps.save()`
- Dynamic render (PHP): `get_block_wrapper_attributes()`

Read:
- `references/supports-and-wrappers.md`
- `references/dynamic-rendering.md` (if dynamic)

### 7) Inner blocks (block composition)

If your block is a “container” that nests other blocks, treat Inner Blocks as a first-class feature:

- Use `useInnerBlocksProps()` to integrate inner blocks with wrapper props.
- Keep migrations in mind if you change inner markup.

Read:
- `references/inner-blocks.md`

### 8) Attributes and serialization

Before changing attributes:

- confirm where the attribute value lives (comment delimiter vs HTML vs context)
- avoid the deprecated `meta` attribute source

Read:
- `references/attributes-and-serialization.md`

### 9) Migrations and deprecations (avoid "Invalid block")

If you change saved markup or attributes:

1. Add a `deprecated` entry (newest → oldest).
2. Provide `save` for old versions and an optional `migrate` to normalize attributes.

Read:
- `references/deprecations.md`

### 10) Tooling and verification commands

- `pnpm build` after every change. The registrar reads `build/`, not
  `sources/`.
- `pnpm lint:scripts`, `pnpm lint:styles`, `pnpm lint:types`.
- `composer cs` and `composer analysis` when you touched `render.php`.
- `pnpm test:e2e` for the front end behaviour. It needs Docker.

Read:
- `references/tooling-and-testing.md`

## Verification

- Block appears in inserter and inserts successfully.
- Saving + reloading does not create “Invalid block”.
- Frontend output matches expectations (static: saved markup; dynamic: server output).
- Assets load where expected (editor vs frontend).
- `pnpm build` succeeds and `build/blocks/<name>/` holds the expected files.
- The lint, the analysis and the tests pass.

## Failure modes / debugging

If something fails, start here:

- `references/debugging.md` (common failures + fastest checks)
- `references/attributes-and-serialization.md` (attributes not saving)
- `references/deprecations.md` (invalid block after change)

## Escalation

If you’re uncertain about upstream behavior/version support, consult canonical docs first:

- WordPress Developer Resources (Block Editor Handbook, Theme Handbook, Plugin Handbook)
- Gutenberg repo docs for bleeding-edge behaviors

# Creating a new block

Every file of a block lives in one directory under `sources/client/blocks/`.
Do not use `@wordpress/create-block`. It scaffolds a `src/` directory and its
own plugin file, which do not match this project.

## Procedure

1. Create the directory `sources/client/blocks/<name>/`.
2. Add `block.json`. Set `"name": "{{PLUGIN_SLUG}}/<name>"`.
3. Add the files that the block needs. Reference each one from `block.json`
   with a path relative to the block directory.
4. Run `pnpm build`.
5. Add a Playwright spec in `tests/e2e/specs/`.

Do not write any PHP to register the block. The `Blocks` module registers
every block of the build directory. See `references/registration.md`.

## Directory contract

```
sources/client/blocks/<name>/
├── block.json      metadata. The only mandatory file.
├── render.php      the server render template, for a dynamic block
├── view.ts         the front end script, for an interactive block
├── types.ts        the types of the block
└── style.scss      the styles of the block
```

`render.php` stays in this directory, next to `block.json`. `wp-scripts`
copies it into `build/blocks/<name>/`, so the relative path stays valid.

## Example block.json

```json
{
	"$schema": "https://schemas.wp.org/trunk/block.json",
	"apiVersion": 3,
	"name": "{{PLUGIN_SLUG}}/<name>",
	"title": "<Title>",
	"category": "widgets",
	"textdomain": "{{TEXT_DOMAIN}}",
	"supports": {
		"html": false,
		"interactivity": true,
		"inserter": false
	},
	"viewScriptModule": "file:./view.js",
	"style": "file:./style-view.css",
	"render": "file:./render.php"
}
```

Note the two indirections:

- `viewScriptModule` points to `view.js`, the build output of `view.ts`.
- `style` points to `style-view.css`, which `wp-scripts` emits when `view.ts`
  imports `style.scss`. Import the stylesheet from `view.ts`.

## Editor scripts

`sources/client/blocks/example` ships no `editorScript`, and the example uses
`"inserter": false`. `@wordpress/blocks` and `@wordpress/block-editor` ship no
TypeScript types, and `pnpm lint:types` runs `tsc --noEmit` over `sources`.

If you need an insertable block, you must first decide how to handle those
missing types. Ask the user before you add `@wordpress/blocks` to
`package.json`.

## Canonical docs

- https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/

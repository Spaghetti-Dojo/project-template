# Registration

This project registers blocks as one collection. Do not register a block one
by one, and do not add PHP for a new block.

## How it works

`{{VENDOR_NAMESPACE}}\{{PLUGIN_NAMESPACE}}\Blocks\BlockRegistrar` runs on
`init` and calls:

```php
wp_register_block_types_from_metadata_collection($blocksDir, $manifest);
```

- `$blocksDir` is `build/blocks`.
- `$manifest` is `build/blocks-manifest.php`, which `wp-scripts` generates.

`WP_BLOCKS_MANIFEST=true` in the `build` script of `package.json` turns the
manifest on. `WP_SOURCE_PATH=sources/client` sets the source root, so
`sources/client/blocks/<name>` becomes `build/blocks/<name>`.

## The manifest keys are directory names

`wp_register_block_types_from_metadata_collection()` registers each entry at
`$path . '/' . $key`. The keys of the manifest are the directory names of the
blocks, not the paths relative to `build`. The collection path must therefore
be `build/blocks`, never `build`.

If you change the block directory layout, check `build/blocks-manifest.php`
and confirm that `$blocksDir . '/' . $key` points to a real `block.json`.

## When a block does not appear

1. Did you run `pnpm build`? The registrar reads `build/`, not `sources/`.
2. Does `build/blocks/<name>/block.json` exist?
3. Does the key of `build/blocks-manifest.php` match the directory name?
4. Does the block have `"inserter": false`? Then it is registered, but it does
   not appear in the inserter. Render it with `do_blocks()` or from a
   template.

## Dynamic render

If `block.json` has a `render` field, the file must exist relative to the
block directory. Inside the template, use `get_block_wrapper_attributes()` for
the wrapper attributes.

Upstream reference:

- https://developer.wordpress.org/reference/functions/register_block_type_from_metadata/

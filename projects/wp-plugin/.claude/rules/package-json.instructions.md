---
paths:
  - "package.json"
---

## WordPress Npm Dependencies

- Prefer dist tags versions constraints in `package.json` for WordPress dependencies to ensure compatibility with the installed WordPress version. e.g. `"@wordpress/block-editor": "wp-6.9"` instead of `"@wordpress/block-editor": "^6.0.0"`. Align the version with the minimum WordPress version supported by the plugin in the `composer.json` file.

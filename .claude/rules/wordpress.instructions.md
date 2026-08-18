---
paths:
  - "sources/server/**/*.php"
---

## WordPress Hooks Naming Convention

When creating custom WordPress actions and filters, follow this naming pattern:

**Pattern:** `{project-name}.{package}.{event-name}`

- **project-name**: The project identifier
- **package**: The package/module name (optional when code is at root level)
- **event-name**: Descriptive name of the event/action
- Use **dashes** (`-`) to separate words within each component

**Examples:**
```php
// Root-level hook (no package component)
do_action('project-name.boot-failed', $exception);

// Package-level hook
do_action('project-name.theme-setup.assets-loaded', $assets);

// Another package example
apply_filters('project-name.blocks.custom-block-registered', $block);
```

**Guidelines:**
- Keep hook names descriptive and self-documenting
- Use past tense when the hook fires **after** an operation completes (e.g., `loaded`, `failed`, `registered`)
- Use present tense when the hook fires **before** or **during** an operation (e.g., `loading`, `processing`)
- For compound event names, apply tense to the action verb (e.g., `boot-failed`, `theme-loaded`, `asset-processing`)
- Avoid underscores - use dashes consistently

## WordPress Npm Dependencies

- Prefer dist tags versions constraints in `package.json` for WordPress dependencies to ensure compatibility with the installed WordPress version. e.g. `"@wordpress/block-editor": "wp-6.9"` instead of `"@wordpress/block-editor": "^6.0.0"`. Align the version with the minimum WordPress version supported by the plugin in the `composer.json` file.

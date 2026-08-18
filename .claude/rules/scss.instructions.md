---
paths:
    - 'sources/client/**/*.scss'
---

## Project Conventions

- Always follow the Mobile First approach.

## Scss Conventions

- Use `mixins.units.rem` or `mixins.units.em` rather than `px` for font sizes, spacing, and other properties that should scale with the user's settings.

## Organization

SCSS is organized atomically:

- `atoms/` — basic elements (buttons, inputs, typography)
- `molecules/` — component combinations
- `organisms/` — complex compositions
- `templates/` - page layouts
- `pages/` - specific page styles
- `block-styles/` — block-specific overrides
- `mixins/` — reusable SCSS mixins

## Coding Style

- Always order the properties in a selector block alphabetically.
- Use the BEM Convention for naming classes. For example, `button`, `button--primary`, `button__icon`.

## BEM Rules

- Don't mix BEM like `element` with `modifier`. `block--modifier__element` is not allowed.
- Don't apply modifiers to elements. For example, `button__icon--primary` is not allowed. Instead, you can use `button--primary .button__icon` to style the icon when the button is primary.

## Files

- SCSS files start with `_` (underscore) unless them are named `index.scss`.
- Each style directory can contain only one `index.scss` file.
- Each directory is a package, and the `index.scss` file is the public API of that package.
- Use `@forward` in `index.scss` to re-export the styles from the other files in the directory. Do not use `@import` in any file.

# Spaghetti Dojo Project Templates

This repository holds project templates. Each directory in `projects/` is one
template. A template has no relation to this repository: all its paths start
from its own root.

## Templates

| Template                                   | Description                                             |
|--------------------------------------------|---------------------------------------------------------|
| [`projects/wp-plugin`](projects/wp-plugin) | A WordPress plugin with blocks, tests and CI workflows. |

## Use a template

Copy the directory of the template into a new project:

```bash
npx tiged Spaghetti-Dojo/project-template/projects/wp-plugin my-plugin
cd my-plugin
git init
node bin/init.mjs
```

The copy has no git history. The `README.md` of the template describes the
initializer.

Do not use the "Use this template" button of GitHub. It copies the full
repository, not one template.

## Change a template

Do the work in the directory of the template, for example
`projects/wp-plugin`. The files there contain tokens such as
`{{PLUGIN_SLUG}}`, so the template does not run before the initializer
replaces them.

This repository runs no CI for the templates. The workflows in
`projects/*/.github/workflows/` start to run only in a project that you create
from the template.

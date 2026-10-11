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

While this repository is private, `tiged` needs the SSH address and the git
mode:

```bash
npx tiged --mode=git git@github.com:Spaghetti-Dojo/project-template/projects/wp-plugin my-plugin
```

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

## Test a template

The tests in `tests/` copy a template into a temporary directory, as a user
does, and run the initializer with dummy values.

| Command             | What it does                                                                                      | Needs                                                  |
|---------------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `pnpm test`         | Tests the initializer: the tokens, the file names, the defaults and the errors.                   | Node 24                                                |
| `pnpm test:install` | Installs the dependencies of an initialized copy, then runs its build, its linters and its tests. | Node 24, pnpm, PHP 8.4, Composer, a network connection |

The tests have no dependencies, so you do not need to install anything in the
root.

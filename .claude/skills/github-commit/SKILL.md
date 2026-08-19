---
name: github-commit
description: Explain how to write a git commit in this project. Conventional Commits format, title and body constraints, types, scopes and examples.
---

# Commit messages

This project follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

## Structure

```
<type>[optional scope][optional !]: <description>

[optional body]

[optional footers]
```

- A blank line separates the title from the body.
- A blank line separates the body from the footers.

## Title

- Maximum 50 characters, and the type and the scope count toward that limit.
- The type is mandatory. The scope and the `!` are optional.
- One space follows the colon.
- Write the description in the imperative present: `add`, `fix`, `remove`.
  Never `adds`, `added` or `adding`.
- Start the description in lower case. Do not end it with a full stop.

## Types

| Type | Use it when the commit |
| --- | --- |
| `feat` | adds a capability that a user of the plugin can see |
| `fix` | corrects wrong behaviour |
| `docs` | changes only prose: `README.md`, `docs/`, `.claude/` |
| `test` | adds or changes tests only |
| `refactor` | changes the structure of the code, and the behaviour stays |
| `perf` | makes the code faster |
| `style` | changes only the format: white space, quotes, the linter |
| `build` | changes the build, `package.json`, `composer.json` or the toolchain |
| `ci` | changes `.github/workflows` |
| `chore` | changes something else: `.gitignore`, the repository setup |
| `revert` | reverts an earlier commit. Name it in the body |

`feat` and `fix` describe the plugin, not the repository. A new block is
`feat`. A new command in `package.json` is `build`. A new skill or a new rule
in `.claude/` is `docs`.

## Scopes

The scope is a noun that names a real part of this project. Use one of:

`blocks`, `server`, `client`, `package`, `tests`, `e2e`, `deps`, `template`,
`claude`, `wp-env`, `docs`

Add a new scope only when it names a directory or a file that exists. Leave
the scope out when the change touches many parts.

## Body

- Wrap every line at 72 characters.
- Explain **why**, not what. The diff already shows what changed.
- Write one topic per paragraph. Use a vertical list for more than three
  items.
- Leave the body out when the title says everything.

## Breaking changes

A breaking change is one that forces the user of the plugin to change code.

Mark it with `!` before the colon, and explain it in a footer:

```
feat(package)!: rename package() to plugin_package()

BREAKING CHANGE: every caller of package() must use plugin_package().
```

`BREAKING CHANGE` must be upper case. `BREAKING-CHANGE` means the same.

## Footers

One footer per line, in the form `Token: value`. Replace the white space of a
token with `-`, for example `Co-authored-by`. `BREAKING CHANGE` is the only
exception.

```
Refs: #42
Co-authored-by: Name <mail@example.com>
```

## Examples

Good:

```
feat(blocks): add a notice block

The block renders through the Interactivity API, so the notice can
close itself without a page load.
```

```
fix(tests): pass the blocks directory to the registrar

The manifest keys are directory names, so the collection path must be
build/blocks. With build, WordPress looked for build/example and
registered nothing.
```

```
ci: run the client unit tests
```

Bad, with the reason:

```
Added a new block                  no type, past tense
feat: stuff                        the description says nothing
fix(blocks): fixed the bug.        past tense, full stop
feat: add the block and fix the    two changes in one commit, and the
      registrar and update the CI  title is longer than 50 characters
```

## Checklist

Before you commit, verify:

- [ ] The title starts with a type from the table.
- [ ] The title is 50 characters or fewer.
- [ ] The description is imperative, lower case, with no full stop.
- [ ] The commit holds one logical change.
- [ ] A blank line separates the title from the body.
- [ ] Every body line is 72 characters or fewer.
- [ ] The body says why.
- [ ] A breaking change carries `!` and a `BREAKING CHANGE:` footer.

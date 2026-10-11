Follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>[optional scope][optional !]: <description>

[optional body]

[optional footers]
```

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `style`, `build`,
  `ci`, `chore`, `revert`.
- Scopes: `blocks`, `server`, `client`, `package`, `tests`, `e2e`, `deps`,
  `template`, `claude`, `wp-env`, `docs`.
- The title must not exceed 50 characters, and the type and the scope count
  toward that limit.
- Write the description in the imperative present, in lower case, with no
  full stop.
- Separate the title and the body with an empty line.
- Wrap every body line at 72 characters. Explain why, not what.
- Mark a breaking change with `!` before the colon and a `BREAKING CHANGE:`
  footer.

The full rules, with examples, are in `.claude/skills/github-commit/SKILL.md`.

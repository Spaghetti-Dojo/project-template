---
name: wordpress-router
description: "Use at the start of a WordPress task in this plugin to pick the right domain skill and guardrails: blocks, Interactivity API, REST API, WP-CLI, PHPStan, performance, security, build and tests."
---

# WordPress Router

## When to use

Use this skill at the start of most WordPress tasks to:

- confirm the target of the request inside this plugin,
- pick the right workflow and guardrails,
- delegate to the most relevant domain skill(s).

## Inputs required

- The intent of the user, and any constraint on the target WordPress or PHP
  version.

## Procedure

1. Locate the target in the layout:
   - `sources/package.php` — the package factory, the public entry point.
   - `sources/server/` — one directory per module.
   - `sources/client/blocks/` — one directory per block. It holds every file
     of the block.
   - `tests/unit/`, `tests/integration/`, `tests/e2e/`.
2. Route by intent. Read:
   - `skills/wordpress-router/references/decision-tree.md`
3. Apply the guardrails of the decision tree before you change anything.

## Verification

Run the commands of the domain skill. For the block and the build commands,
read `skills/wp-block-development/references/tooling-and-testing.md`.

## Escalation

If the intent stays ambiguous, ask one question. Name the two most likely
targets, and let the user pick.

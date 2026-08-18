#!/usr/bin/env bash
set -uo pipefail

errors=0
failed_step=""

run_step() {
  if [[ $errors -ne 0 ]]; then
    return
  fi

  local label="$1"
  shift
  if ! "$@" 2>&1; then
    failed_step="$label"
    errors=1
  fi
}

# PHP: fix then check
if find sources/server -name '*.php' -print -quit 2>/dev/null | grep -q .; then
  run_step "php:cs:fix"   composer cs:fix
  run_step "php:cs"       composer cs
  run_step "php:analysis" composer analysis
fi

# JS/TS: fix then check
if find sources/client -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -print -quit 2>/dev/null | grep -q .; then
  run_step "scripts:fix"  pnpm lint:scripts:fix
  run_step "scripts"      pnpm lint:scripts
fi

# SCSS/CSS: fix then check
if find sources/client -name '*.scss' -o -name '*.css' -print -quit 2>/dev/null | grep -q .; then
  run_step "styles:fix"   pnpm lint:styles:fix
  run_step "styles"       pnpm lint:styles
fi

if [[ $errors -ne 0 ]]; then
  echo "QA failed at step: ${failed_step}. Fix issues before continuing."
fi

exit $errors

#!/usr/bin/env bash
# Unit tests for qa.sh — pure bash, no bats required.
# Run: bash .claude/hooks/qa.test.sh
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QA="$SCRIPT_DIR/qa.sh"

pass=0
fail=0

BASE_TMP="$(mktemp -d)"
trap 'rm -rf "$BASE_TMP"' EXIT
mktmp() { mktemp -d "$BASE_TMP/qa.XXXXXX"; }

ok()   { printf '  ok   - %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  FAIL - %s\n' "$1"; fail=$((fail+1)); }

assert_contains() {
  local hay="$1" needle="$2" msg="$3"
  case "$hay" in
    *"$needle"*) ok "$msg" ;;
    *) bad "$msg (missing: $needle)"; printf '       output: %s\n' "$hay" ;;
  esac
}

assert_not_contains() {
  local hay="$1" needle="$2" msg="$3"
  case "$hay" in
    *"$needle"*) bad "$msg (unexpected: $needle)"; printf '       output: %s\n' "$hay" ;;
    *) ok "$msg" ;;
  esac
}

assert_empty() {
  local hay="$1" msg="$2"
  if [[ -z "$hay" ]]; then ok "$msg"; else bad "$msg (expected empty)"; printf '       output: %s\n' "$hay"; fi
}

# Builds a throwaway git repo with stubbed composer/pnpm on PATH.
# QA_FAIL (space list of subcommands) makes those stub calls exit 1.
make_repo() {
  local dir
  dir="$(mktmp)"
  git -C "$dir" init -q
  git -C "$dir" config user.email t@t.t
  git -C "$dir" config user.name t
  git -C "$dir" config commit.gpgsign false

  mkdir "$dir/bin"
  cat > "$dir/bin/composer" <<'STUB'
#!/usr/bin/env bash
for f in ${QA_FAIL:-}; do [[ "$1" == "$f" ]] && { echo "stub composer $1 failed"; exit 1; }; done
exit 0
STUB
  cat > "$dir/bin/pnpm" <<'STUB'
#!/usr/bin/env bash
for f in ${QA_FAIL:-}; do [[ "$1" == "$f" ]] && { echo "stub pnpm $1 failed"; exit 1; }; done
exit 0
STUB
  chmod +x "$dir/bin/composer" "$dir/bin/pnpm"
  echo "$dir"
}

run_qa() { # dir [QA_FAIL]
  local dir="$1" qafail="${2:-}"
  ( cd "$dir" && PATH="$dir/bin:$PATH" QA_FAIL="$qafail" bash "$QA" )
}

# --- not a git repo ---
t_not_git() {
  local dir; dir="$(mktmp)"
  local out; out="$(cd "$dir" && bash "$QA")"
  assert_contains "$out" "not a git repo" "skips when not a git repo"
}

# --- php changed, tools pass -> no block ---
t_php_pass() {
  local dir; dir="$(make_repo)"
  : > "$dir/a.php"
  local out; out="$(run_qa "$dir")"
  assert_empty "$out" "no output when php tools pass"
}

# --- php changed, composer cs fails -> block ---
t_php_fail() {
  local dir; dir="$(make_repo)"
  : > "$dir/a.php"
  local out; out="$(run_qa "$dir" "cs")"
  assert_contains "$out" '"decision": "block"' "blocks when php cs fails"
  assert_contains "$out" "php:cs" "reason names failing php step"
}

# --- REGRESSION: a fixer exit code must not block (phpcbf exits 1 when it fixes) ---
t_fixer_code_ignored() {
  local dir; dir="$(make_repo)"
  : > "$dir/a.php"
  : > "$dir/a.ts"
  : > "$dir/a.scss"
  local out; out="$(run_qa "$dir" "cs:fix lint:scripts:fix lint:styles:fix")"
  assert_empty "$out" "non-zero fixer exit code does not block"
}

# --- only style changed -> only style steps run ---
t_style_only() {
  local dir; dir="$(make_repo)"
  : > "$dir/a.scss"
  local out; out="$(run_qa "$dir" "lint:styles")"
  assert_contains "$out" "styles" "blocks on style lint failure"
  assert_not_contains "$out" "php:cs" "no php steps for style-only change"
}

# --- deletion only -> no buckets, no output ---
t_delete_only() {
  local dir; dir="$(make_repo)"
  : > "$dir/gone.php"
  git -C "$dir" add gone.php && git -C "$dir" commit -qm seed
  git -C "$dir" rm -q gone.php
  local out; out="$(run_qa "$dir" "cs")"
  assert_empty "$out" "deletion alone triggers no QA steps"
}

# --- REGRESSION: rename .scss -> .php must bucket as php, not style ---
t_rename_buckets() {
  local dir; dir="$(make_repo)"
  : > "$dir/old.scss"
  git -C "$dir" add old.scss && git -C "$dir" commit -qm seed
  git -C "$dir" mv old.scss new.php
  # Fail every possible step; assert php ran and style did NOT.
  local out; out="$(run_qa "$dir" "cs:fix cs analysis lint:styles:fix lint:styles")"
  assert_contains "$out" "php:cs" "rename new ext (.php) is linted"
  assert_not_contains "$out" "styles" "rename orig ext (.scss) does not leak to styles"
}

t_not_git
t_php_pass
t_php_fail
t_fixer_code_ignored
t_style_only
t_delete_only
t_rename_buckets

echo "-----"
echo "passed: $pass  failed: $fail"
[[ $fail -eq 0 ]]

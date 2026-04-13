#!/usr/bin/env bash
# =============================================================
#  DevSphere — Test Runner Template
#
#  INSTRUCTIONS FOR TASK CREATORS:
#  ─────────────────────────────────────────────────────────────
#  1. Copy this entire _template/ directory into your task repo.
#  2. Edit the "CONFIGURE" section below to match your task.
#  3. See SCORER_GUIDE.md for detailed guidance and examples.
#
#  Platform support:
#    Windows  — works via Git for Windows (bundles bash + utilities)
#    macOS    — works natively; TLE uses gtimeout if coreutils installed
#    Linux    — full support
#
#  This script must:
#    - Exit 0  when ALL tests pass
#    - Exit 1  when ANY test fails (compilation, wrong output,
#              TLE, runtime error, etc.)
#
#  It is called by:
#    - The pre-commit hook  (on participant's machine)
#    - fork-ci.yml          (on fork push, participant's CI)
#    - pr-checks.yml        (on PR, authoritative)
# =============================================================
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAMPLES="$ROOT/samples"

# ╔═════════════════════════════════════════════════════════════╗
# ║  CONFIGURE — edit this section for your specific task      ║
# ╚═════════════════════════════════════════════════════════════╝

# ── Option A: C / C++ solution ────────────────────────────────
# SOLUTION_FILE="$ROOT/solution.cpp"
# BIN="$ROOT/solution_bin"
# compile() { g++ -O2 -std=c++17 -o "$BIN" "$SOLUTION_FILE"; }
# run()     { "$BIN" < "$1"; }

# ── Option B: Python solution ─────────────────────────────────
# SOLUTION_FILE="$ROOT/solution.py"
# compile() { python3 -m py_compile "$SOLUTION_FILE"; }
# run()     { python3 "$SOLUTION_FILE" < "$1"; }

# ── Option C: JavaScript / Node solution ─────────────────────
# SOLUTION_FILE="$ROOT/solution.js"
# compile() { node --check "$SOLUTION_FILE"; }
# run()     { node "$SOLUTION_FILE" < "$1"; }

#── Option D: Custom build step (web / app tasks) ─────────────
compile() {
  cd "$ROOT"
  npm ci --silent

}
run() {
  # For non-stdio tasks, adapt this to run your checker script
  node "$ROOT/tests/visible.test.js" "$1"
}

# ── Set your timeout (seconds) ────────────────────────────────
TIMEOUT=40

# ── Uncomment exactly ONE compile and ONE run above, then ─────


# ╔═════════════════════════════════════════════════════════════╗
# ║  TEST RUNNER — do not modify below this line               ║
# ╚═════════════════════════════════════════════════════════════╝

# ── Cross-platform timeout helper ─────────────────────────────
# GNU timeout (Linux/WSL/CI): timeout 40s ./bin
# macOS + brew coreutils:     gtimeout 40s ./bin
# Git Bash on Windows:        no GNU timeout locally — runs without
#                             time limit (CI always enforces it on
#                             Linux runners)
_run_timed() {
  local secs=$1; shift
  if command -v timeout &>/dev/null && timeout --version &>/dev/null 2>&1; then
    timeout "${secs}s" "$@"
  elif command -v gtimeout &>/dev/null; then
    gtimeout "${secs}s" "$@"
  else
    "$@"
  fi
}

echo "── Compile ──────────────────────────────────────────────"
if ! compile 2>&1; then
  echo ""
  echo "FATAL: Build/compile step failed."
  exit 1
fi
echo "OK"
echo ""

echo "── Tests ────────────────────────────────────────────────"
if _run_timed "$TIMEOUT" node "$ROOT/tests/visible.test.js"; then
  echo ""
  echo "────────────────────────────────────────────────────────"
  echo "  Result: tests passed"
  echo "────────────────────────────────────────────────────────"
  exit 0
else
  ec=$?
  if [[ $ec -eq 124 ]]; then
    echo "FAIL  — TLE (>${TIMEOUT}s)"
  else
    echo "FAIL  — runtime/test failure (exit $ec)"
  fi
  exit 1
fi

[[ $FAIL -eq 0 ]]
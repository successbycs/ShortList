#!/usr/bin/env bash
set -euo pipefail

# Starts only the official upstream binary. It is intentionally foregrounded:
# the operator controls its lifetime and must provide ephemeral GitHub auth.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly port="${SYMPHONY_DASHBOARD_PORT:-8765}"
readonly workspace_root="${SYMPHONY_WORKSPACE_ROOT:-${root}/var/symphony-upstream/workspaces}"
readonly logs_root="${SYMPHONY_LOGS_ROOT:-${root}/var/symphony-upstream/logs}"
readonly installer="${root}/scripts/install_upstream_symphony.sh"

mkdir -p "${root}/var/symphony-upstream"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  printf '%s\n' "GITHUB_TOKEN is required and must be supplied only in this process environment." >&2
  exit 2
fi
if [[ "${SYMPHONY_UNSAFE_PREVIEW_ACK:-}" != "I understand" ]]; then
  printf '%s\n' "Set SYMPHONY_UNSAFE_PREVIEW_ACK='I understand' to explicitly acknowledge the upstream preview warning." >&2
  exit 2
fi
if [[ "${SYMPHONY_FULL_ACCESS_ACK:-}" != "I understand" ]]; then
  printf '%s\n' "Set SYMPHONY_FULL_ACCESS_ACK='I understand' to explicitly acknowledge the Codex full-access worker policy." >&2
  exit 2
fi
if ! command -v codex >/dev/null; then
  printf '%s\n' "missing prerequisite: codex" >&2
  exit 2
fi
"${installer}" >/dev/null
binary="$("${installer}" --print-path)"
mkdir -p "${workspace_root}" "${logs_root}"

export SYMPHONY_WORKSPACE_ROOT="${workspace_root}"
export SYMPHONY_SOURCE_REPO="${SYMPHONY_SOURCE_REPO:-${root}}"
printf 'Starting upstream Symphony dashboard at http://127.0.0.1:%s/\n' "${port}"
printf 'State API: http://127.0.0.1:%s/api/v1/state\n' "${port}"
exec "${binary}" \
  --i-understand-that-this-will-be-running-without-the-usual-guardrails \
  --logs-root "${logs_root}" \
  --port "${port}" \
  "${root}/WORKFLOW.md"

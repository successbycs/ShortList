#!/usr/bin/env bash
set -euo pipefail

# Installs exactly the audited official upstream Linux release below ignored
# var/. It never reads or writes credentials.
readonly VERSION="v0.0.3"
readonly ASSET="symphony-v0.0.3-linux_x86_64"
readonly SHA256="ea35a04a54a6d37c0cafe3f195da871e47614a8c05765b90dbb4cac32e1435ee"
readonly DOWNLOAD_URL="https://github.com/openai/symphony/releases/download/${VERSION}/${ASSET}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
destination="${root}/var/tools/${ASSET}"

usage() {
  printf '%s\n' "Usage: $0 [--dry-run|--print-path]"
}

case "${1:-}" in
  "") ;;
  --dry-run)
    [[ "$(uname -s)" == "Linux" ]] || { printf '%s\n' "unsupported platform: expected Linux" >&2; exit 2; }
    [[ "$(uname -m)" == "x86_64" ]] || { printf '%s\n' "unsupported architecture: expected x86_64" >&2; exit 2; }
    command -v curl >/dev/null || { printf '%s\n' "missing prerequisite: curl" >&2; exit 2; }
    command -v sha256sum >/dev/null || { printf '%s\n' "missing prerequisite: sha256sum" >&2; exit 2; }
    printf 'ready: %s %s\n' "${VERSION}" "${ASSET}"
    exit 0
    ;;
  --print-path)
    printf '%s\n' "${destination}"
    exit 0
    ;;
  *) usage >&2; exit 2 ;;
esac

"$0" --dry-run >/dev/null
mkdir -p "$(dirname "${destination}")"

if [[ -x "${destination}" ]] && [[ "$(sha256sum "${destination}" | awk '{print $1}')" == "${SHA256}" ]]; then
  printf 'already verified: %s\n' "${destination}"
  exit 0
fi

temporary="${destination}.partial.$$"
trap 'rm -f "${temporary}"' EXIT
curl --fail --location --silent --show-error --output "${temporary}" "${DOWNLOAD_URL}"
printf '%s  %s\n' "${SHA256}" "${temporary}" | sha256sum --check --status
chmod 0755 "${temporary}"
mv -f "${temporary}" "${destination}"
trap - EXIT
printf 'installed and verified: %s\n' "${destination}"

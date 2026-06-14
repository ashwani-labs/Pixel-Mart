#!/usr/bin/env bash
set -euo pipefail
SETUP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SETUP_ROOT"
docker compose down

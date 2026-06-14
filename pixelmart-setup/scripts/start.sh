#!/usr/bin/env bash
# Start PixelMart stack. Run: ./pixelmart-setup/scripts/start.sh
set -euo pipefail
SETUP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SETUP_ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created pixelmart-setup/.env from .env.example"
fi

docker compose up --build

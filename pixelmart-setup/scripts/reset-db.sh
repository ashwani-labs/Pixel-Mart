#!/usr/bin/env bash
set -euo pipefail
SETUP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SETUP_ROOT"
echo "Stopping stack and removing volumes (mysql_data will be deleted)..."
docker compose down -v
echo "Done. Next start will re-run sql/01-schemas.sql and Flyway migrations."

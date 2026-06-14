$SetupRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $SetupRoot
Write-Host "Stopping stack and removing volumes (mysql_data will be deleted)..."
docker compose down -v
Write-Host "Done. Next start will re-run sql/01-schemas.sql and Flyway migrations."

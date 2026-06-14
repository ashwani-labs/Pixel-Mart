$SetupRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $SetupRoot
docker compose down

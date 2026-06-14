# Start PixelMart stack (Windows). Run: .\pixelmart-setup\scripts\start.ps1
$ErrorActionPreference = "Stop"
$SetupRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $SetupRoot

$envFile = Join-Path $SetupRoot ".env"
$example = Join-Path $SetupRoot ".env.example"
if (-not (Test-Path $envFile)) {
    Copy-Item $example $envFile
    Write-Host "Created pixelmart-setup\.env from .env.example"
}

docker compose up --build

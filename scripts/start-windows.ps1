# HMS e-Register — Windows 11 offline / local development
# Usage: .\scripts\start-windows.ps1
# Optional: .\scripts\start-windows.ps1 -WithDocker   (needs Docker Desktop running)

param(
    [switch]$WithDocker,
    [switch]$SkipMigrate
)

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "=== HMS e-Register (Windows) ===" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Copy-Item "deploy\env\windows.env.example" ".env"
    Write-Host "Created .env from deploy\env\windows.env.example — edit DB credentials if needed." -ForegroundColor Yellow
}

if (-not $SkipMigrate) {
    Write-Host "Running database migration..."
    node database/migrate.js
}

if ($WithDocker) {
    Write-Host "Starting MinIO + Redis (Docker)..."
    docker compose -f docker-compose.infra.yml up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker failed — start Docker Desktop or run without -WithDocker" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Running without Docker (core features only; file upload needs MinIO or AWS S3)." -ForegroundColor Yellow
}

Write-Host "Starting API + Web..."
npm run dev

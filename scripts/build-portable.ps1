# HMS e-Register — Build portable Windows distribution
# Usage: .\scripts\build-portable.ps1 [-SkipMariaDB] [-SkipDownload]
# Output: dist\portable\  and  dist\HMS-Portable.zip

param(
    [switch]$SkipMariaDB,
    [switch]$SkipDownload,
    [switch]$Lite  # Skip MariaDB for smaller build (~150 MB less); requires external MySQL in .env
)
if ($Lite) { $SkipMariaDB = $true }

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$OutDir = Join-Path $Root "dist\portable"
$CacheDir = Join-Path $Root "dist\cache"
$NodeVersion = "20.18.1"
$MariaVersion = "10.11.10"

Write-Host "=== HMS Portable Build ===" -ForegroundColor Cyan

# --- 1. Build application ---
Write-Host "`n[1/6] Building apps..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) { npm install }
npm run build:shared
npm run build --workspace=@hms/api
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:4000"
$env:NEXT_PUBLIC_WS_URL = "ws://127.0.0.1:4000"
npm run build --workspace=@hms/web

# --- 2. Prepare output directory ---
Write-Host "`n[2/6] Preparing output directory..." -ForegroundColor Yellow
if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutDir "data") -Force | Out-Null

# --- 3. Download portable Node.js runtime ---
Write-Host "`n[3/6] Bundling Node.js runtime..." -ForegroundColor Yellow
$NodeZip = Join-Path $CacheDir "node-v$NodeVersion-win-x64.zip"
$NodeUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
if (-not $SkipDownload -and -not (Test-Path $NodeZip)) {
    Write-Host "  Downloading Node.js $NodeVersion..."
    Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeZip -UseBasicParsing
}
Expand-Archive -Path $NodeZip -DestinationPath $CacheDir -Force
New-Item -ItemType Directory -Path (Join-Path $OutDir "runtime") -Force | Out-Null
Copy-Item (Join-Path $CacheDir "node-v$NodeVersion-win-x64\node.exe") (Join-Path $OutDir "runtime\node.exe") -Force

# --- 4. Download MariaDB (embedded database) ---
if (-not $SkipMariaDB) {
    Write-Host "`n[4/6] Bundling MariaDB..." -ForegroundColor Yellow
    $MariaZip = Join-Path $CacheDir "mariadb-$MariaVersion-winx64.zip"
    $MariaUrl = "https://archive.mariadb.org/mariadb-$MariaVersion/winx64-packages/mariadb-$MariaVersion-winx64.zip"
    if (-not $SkipDownload -and -not (Test-Path $MariaZip)) {
        Write-Host "  Downloading MariaDB $MariaVersion (~80 MB)..."
        Invoke-WebRequest -Uri $MariaUrl -OutFile $MariaZip -UseBasicParsing
    }
    $MariaExtract = Join-Path $CacheDir "mariadb-$MariaVersion-winx64"
    if (-not (Test-Path $MariaExtract)) {
        Expand-Archive -Path $MariaZip -DestinationPath $CacheDir -Force
    }
    Copy-Item $MariaExtract (Join-Path $OutDir "mariadb") -Recurse -Force
} else {
    Write-Host "`n[4/6] Skipping MariaDB (use external DB in .env)" -ForegroundColor Yellow
}

# --- 5. Assemble API + Web + database ---
Write-Host "`n[5/6] Assembling application files..." -ForegroundColor Yellow

# API
$ApiOut = Join-Path $OutDir "api"
New-Item -ItemType Directory -Path $ApiOut -Force | Out-Null
Copy-Item "apps\api\dist" (Join-Path $ApiOut "dist") -Recurse -Force

# Production dependencies for API
$ApiPkg = Get-Content "apps\api\package.json" -Raw | ConvertFrom-Json
$PortableApiPkg = @{
    name = "hms-api-portable"
    version = "1.0.0"
    private = $true
    dependencies = $ApiPkg.dependencies
}
$PortableApiPkg.dependencies."@hms/shared" = "file:../packages/shared"
$PortableApiPkg | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $ApiOut "package.json") -Encoding UTF8

$SharedOut = Join-Path $OutDir "packages\shared"
New-Item -ItemType Directory -Path $SharedOut -Force | Out-Null
Copy-Item "packages\shared\package.json" $SharedOut -Force
Copy-Item "packages\shared\dist" (Join-Path $SharedOut "dist") -Recurse -Force -ErrorAction SilentlyContinue
if (-not (Test-Path (Join-Path $SharedOut "dist"))) {
    Copy-Item "packages\shared\src\index.js" (Join-Path $SharedOut "dist\index.js") -Force
    Copy-Item "packages\shared\src\index.d.ts" (Join-Path $SharedOut "dist\index.d.ts") -Force -ErrorAction SilentlyContinue
}

Write-Host "  Installing API production dependencies..."
Push-Location $ApiOut
$prevEap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
cmd /c "npm install --omit=dev --ignore-scripts >nul 2>&1"
$ErrorActionPreference = $prevEap
if ($LASTEXITCODE -ne 0) { throw "API npm install failed (exit $LASTEXITCODE)" }
Pop-Location

# Next.js standalone
$StandaloneSrc = "apps\web\.next\standalone"
$WebOut = Join-Path $OutDir "web"
if (Test-Path (Join-Path $StandaloneSrc "apps\web")) {
  Copy-Item (Join-Path $StandaloneSrc "apps\web") $WebOut -Recurse -Force
  $StaticSrc = "apps\web\.next\static"
  New-Item -ItemType Directory -Path (Join-Path $WebOut ".next\static") -Force | Out-Null
  Copy-Item $StaticSrc (Join-Path $WebOut ".next\static") -Recurse -Force
  Copy-Item "apps\web\public" (Join-Path $WebOut "public") -Recurse -Force
} elseif (Test-Path (Join-Path $StandaloneSrc "server.js")) {
  Copy-Item $StandaloneSrc $WebOut -Recurse -Force
  Copy-Item "apps\web\.next\static" (Join-Path $WebOut ".next\static") -Recurse -Force
  Copy-Item "apps\web\public" (Join-Path $WebOut "public") -Recurse -Force
} else {
  throw "Next.js standalone output not found. Run npm run build --workspace=@hms/web first."
}

# Database migrator + schema (with bundled mysql2 for offline machines)
Copy-Item "database" (Join-Path $OutDir "database") -Recurse -Force
@{ name = "hms-migrate"; private = $true; dependencies = @{ mysql2 = "3.11.5" } } |
    ConvertTo-Json | Set-Content (Join-Path $OutDir "database\package.json") -Encoding UTF8
Push-Location (Join-Path $OutDir "database")
$ErrorActionPreference = 'Continue'
cmd /c "npm install --omit=dev >nul 2>&1"
$ErrorActionPreference = $prevEap
if ($LASTEXITCODE -ne 0) { throw "migrate npm install failed" }
Pop-Location

# Portable .env
Copy-Item "deploy\env\portable.env.example" (Join-Path $OutDir ".env") -Force

# README for end users
@'
# HMS e-Register — Portable Edition

## Quick Start
1. Extract this folder anywhere on Windows (USB drive, Desktop, etc.)
2. Double-click **HMS.exe**
3. Browser opens automatically at http://127.0.0.1:3000

## Default Login
- Email: admin@hms.gov.in
- Password: Admin@123

## Requirements
- Windows 10/11 (64-bit)
- No Node.js, Python, MySQL, or Docker installation needed

## Data Location
All data is stored in the `data\` folder next to HMS.exe:
- `data\mysql\` — database files
- `data\uploads\` — uploaded documents

## Stopping
Press Ctrl+C in the console window, or close the window.

## OCR (Optional)
OCR requires Python 3.11+ installed separately.
For lightweight use, core features work without OCR.

## Troubleshooting
- If port 3000/4000 is in use, edit `.env` and change PORT / WEB_PORT
- Antivirus may flag HMS.exe — add an exception for this folder
'@ | Set-Content (Join-Path $OutDir "README.txt") -Encoding UTF8

# --- 6. Build HMS.exe launcher ---
Write-Host "`n[6/6] Building HMS.exe launcher..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "launcher")
$prevEap2 = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
if (-not (Test-Path "node_modules\pkg")) { cmd /c "npm install pkg --no-save >nul 2>&1" }
cmd /c "npx pkg launcher.js --targets node18-win-x64 --output `"$OutDir\HMS.exe`""
$ErrorActionPreference = $prevEap2
if (-not (Test-Path (Join-Path $OutDir "HMS.exe"))) { throw "HMS.exe build failed" }
Pop-Location

# Create ZIP archive
$ZipPath = Join-Path $Root "dist\HMS-Portable.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Write-Host "`nCreating ZIP archive..."
Compress-Archive -Path $OutDir -DestinationPath $ZipPath -Force

# Size report
$Size = (Get-ChildItem $OutDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host "  Folder: $OutDir"
Write-Host "  ZIP:    $ZipPath"
Write-Host ("  Size:   {0:N1} MB" -f $Size)
Write-Host ""
Write-Host "Run: $OutDir\HMS.exe" -ForegroundColor Cyan

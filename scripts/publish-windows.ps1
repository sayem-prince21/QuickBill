# ==============================================================================
# QuickBilling POS - Windows x64 Automated Production Publish & Packaging Script
# ==============================================================================
# Usage:
#   Open PowerShell as Administrator (or standard user with execute rights)
#   Run: .\scripts\publish-windows.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  QuickBilling: Packaging Offline Windows Desktop App     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Check prerequisite toolchain
Write-Host "`n>>> [Step 1/5] Checking Build Environment..." -ForegroundColor Cyan
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js (npm) is required for frontend build but was not found in PATH."
}
if (-not (Get-Command "dotnet" -ErrorAction SilentlyContinue)) {
    Write-Error ".NET 8.0 SDK is required for backend build but was not found in PATH."
}

# 2. Build React Vite SPA frontend
Write-Host "`n>>> [Step 2/5] Compiling Production Frontend Assets..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed with exit code $LASTEXITCODE"
}

# 3. Copy production static files to ASP.NET Core wwwroot
Write-Host "`n>>> [Step 3/5] Syncing Static Bundle to ASP.NET Core wwwroot..." -ForegroundColor Cyan
$wwwroot = Join-Path $PSScriptRoot "..\src\dotnet\QuickBilling.Api\wwwroot"
if (Test-Path $wwwroot) {
    Remove-Item -Recurse -Force $wwwroot
}
New-Item -ItemType Directory -Path $wwwroot -Force | Out-Null
Copy-Item -Recurse -Force (Join-Path $PSScriptRoot "..\dist\*") $wwwroot
Write-Host "Static bundle copied successfully." -ForegroundColor Green

# 4. Publish Self-Contained ASP.NET Core x64 App
Write-Host "`n>>> [Step 4/5] Publishing Self-Contained Windows x64 .NET App..." -ForegroundColor Cyan
$apiProj = Join-Path $PSScriptRoot "..\src\dotnet\QuickBilling.Api\QuickBilling.Api.csproj"
$publishOut = Join-Path $PSScriptRoot "..\dist\publish-win64"

dotnet publish $apiProj `
    -c Release `
    -r win-x64 `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:IncludeNativeLibrariesForSelfExtract=true `
    -o $publishOut

if ($LASTEXITCODE -ne 0) {
    Write-Error ".NET publish failed with exit code $LASTEXITCODE"
}
Write-Host "Self-contained .NET app published to $publishOut" -ForegroundColor Green

# 5. Compile Inno Setup Installer
Write-Host "`n>>> [Step 5/5] Building Windows Setup Installer..." -ForegroundColor Cyan
$innoScript = Join-Path $PSScriptRoot "..\installer\installer.iss"
$innoCompiler = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"

if (Test-Path $innoCompiler) {
    & $innoCompiler $innoScript
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Installer generated in: installer\output       " -ForegroundColor Green
    Write-Host "  File: QuickBilling-Setup.exe                            " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "`nInno Setup compiler (ISCC.exe) was not found at standard path:" -ForegroundColor Yellow
    Write-Host "  $innoCompiler" -ForegroundColor Yellow
    Write-Host "You can open '$innoScript' manually inside Inno Setup IDE and click 'Compile'." -ForegroundColor Yellow
}

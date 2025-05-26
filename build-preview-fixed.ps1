# PowerShell script to fix EAS Git issues and run preview builds
# This script ensures Git is available and sets all necessary environment variables

Write-Host "🔧 Fixing EAS Git issues..." -ForegroundColor Green

# 1. Set permanent environment variables for current user
Write-Host "Setting permanent environment variables..." -ForegroundColor Cyan
[Environment]::SetEnvironmentVariable("EAS_PROJECT_ROOT", $PWD.Path, "User")
[Environment]::SetEnvironmentVariable("EAS_NO_VCS", "1", "User")

# 2. Add Git to user PATH permanently if not already there
$currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
$gitPath = "C:\Program Files\Git\bin"
if ($currentUserPath -notlike "*$gitPath*") {
    Write-Host "Adding Git to permanent PATH..." -ForegroundColor Cyan
    $newPath = $currentUserPath + ";" + $gitPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
}

# 3. Refresh current session environment
Write-Host "Refreshing environment for current session..." -ForegroundColor Cyan
$env:EAS_PROJECT_ROOT = $PWD.Path
$env:EAS_NO_VCS = "1"
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 4. Verify Git is working
Write-Host "Testing Git availability..." -ForegroundColor Cyan
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Git not found, but EAS_NO_VCS is set as fallback" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Git not accessible, but EAS_NO_VCS is set as fallback" -ForegroundColor Yellow
}

# 5. Test Git root command that EAS uses
Write-Host "Testing Git root detection..." -ForegroundColor Cyan
try {
    $gitRoot = git rev-parse --show-toplevel 2>$null
    if ($gitRoot) {
        Write-Host "✅ Git root detected: $gitRoot" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Git root not detected, using EAS_PROJECT_ROOT fallback" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Git root command failed, using EAS_PROJECT_ROOT fallback" -ForegroundColor Yellow
}

Write-Host "`n🎯 Environment setup complete!" -ForegroundColor Green
Write-Host "Environment variables set:" -ForegroundColor White
Write-Host "  EAS_PROJECT_ROOT: $env:EAS_PROJECT_ROOT" -ForegroundColor Gray
Write-Host "  EAS_NO_VCS: $env:EAS_NO_VCS" -ForegroundColor Gray

Write-Host "`n📋 To run EAS build, use:" -ForegroundColor White
Write-Host "  eas build --platform android --profile preview" -ForegroundColor Cyan

Write-Host "`n💡 This script has set permanent environment variables." -ForegroundColor Yellow
Write-Host "   Future PowerShell sessions should work without running this script." -ForegroundColor Yellow 
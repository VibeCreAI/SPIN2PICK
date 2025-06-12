# EAS Build wrapper script that eliminates Git warnings
# This script sets all necessary environment variables before running EAS build

param(
    [string]$Platform = "android",
    [string]$Profile = "preview"
)

Write-Host "🚀 Running EAS build with proper Git detection..." -ForegroundColor Green

# Set all Git-related environment variables
$env:GIT_EXEC_PATH = "C:\Program Files\Git\bin"
$env:PATH = "C:\Program Files\Git\bin;" + $env:PATH
$env:EAS_PROJECT_ROOT = $PWD.Path

# Alternative: Force EAS to skip VCS checks (if Git detection still fails)
# $env:EAS_NO_VCS = "1"

Write-Host "Environment configured:" -ForegroundColor Cyan
Write-Host "  GIT_EXEC_PATH: $env:GIT_EXEC_PATH" -ForegroundColor Gray
Write-Host "  EAS_PROJECT_ROOT: $env:EAS_PROJECT_ROOT" -ForegroundColor Gray

Write-Host "`nRunning: eas build --platform $Platform --profile $Profile" -ForegroundColor Yellow

# Run EAS build with proper environment
eas build --platform $Platform --profile $Profile

Write-Host "`n✅ Build command completed!" -ForegroundColor Green 
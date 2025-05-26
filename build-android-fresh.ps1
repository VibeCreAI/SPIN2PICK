# PowerShell script for fresh Android build with all cache clearing
# This script ensures splash screen and other assets are properly updated

Write-Host "Starting fresh Android build process..." -ForegroundColor Green

# Set environment variable to bypass VCS if needed
$env:EAS_NO_VCS = "1"

# Refresh PATH to include any newly installed tools
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Clearing all caches..." -ForegroundColor Yellow

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force

# Clear Expo cache
Write-Host "Clearing Expo cache..." -ForegroundColor Cyan
npx expo install --fix

# Clear Metro cache
Write-Host "Clearing Metro cache..." -ForegroundColor Cyan
npx expo start --clear

# Wait a moment for cache clearing
Start-Sleep -Seconds 2

Write-Host "Running EAS build with all cache clearing options..." -ForegroundColor Green

# Run the EAS build with maximum cache clearing
eas build --platform android --clear-cache --non-interactive

Write-Host "Fresh build command completed!" -ForegroundColor Green
Write-Host "If splash screen still doesn't update, try renaming the splash file and updating app.json" -ForegroundColor Yellow 
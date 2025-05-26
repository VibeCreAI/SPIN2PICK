# PowerShell script to automatically fix splash screen issues
# This script removes native directories and regenerates them with Expo prebuild

Write-Host "🚀 Starting automated splash screen fix..." -ForegroundColor Green

# Set environment variables
$env:EAS_NO_VCS = "1"
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "📁 Backing up and removing native directories..." -ForegroundColor Yellow

# Backup existing native directories (optional)
if (Test-Path "android") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Move-Item "android" "android_backup_$timestamp" -Force
    Write-Host "✅ Android directory backed up to android_backup_$timestamp" -ForegroundColor Cyan
}

if (Test-Path "ios") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Move-Item "ios" "ios_backup_$timestamp" -Force
    Write-Host "✅ iOS directory backed up to ios_backup_$timestamp" -ForegroundColor Cyan
}

Write-Host "🧹 Clearing all caches..." -ForegroundColor Yellow

# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo install --fix

Write-Host "🔄 Running Expo prebuild to regenerate native projects..." -ForegroundColor Yellow

# Regenerate native projects with Expo prebuild
npx expo prebuild --clean

Write-Host "🎉 Native projects regenerated successfully!" -ForegroundColor Green
Write-Host "Your splash screen should now use the correct image from app.json!" -ForegroundColor Green
Write-Host "" 
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test locally: npx expo run:android" -ForegroundColor White
Write-Host "2. Or build with EAS: eas build --platform android" -ForegroundColor White
Write-Host "3. The splash screen should now show your updated image!" -ForegroundColor White 